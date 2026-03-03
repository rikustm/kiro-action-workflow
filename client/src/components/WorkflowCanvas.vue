<template>
  <div
    ref="canvasContainer"
    class="workflow-canvas relative w-full h-full bg-gray-100 overflow-hidden"
    @mousedown="handleCanvasMouseDown"
    @mousemove="handleCanvasMouseMove"
    @mouseup="handleCanvasMouseUp"
  >
    <!-- Grid Background -->
    <div class="absolute inset-0 opacity-20" style="
      background-image: 
        linear-gradient(to right, #e5e7eb 1px, transparent 1px),
        linear-gradient(to bottom, #e5e7eb 1px, transparent 1px);
      background-size: 20px 20px;
    "></div>

    <!-- Canvas Content (with pan/zoom transform) -->
    <div
      ref="canvasContent"
      class="absolute"
      :style="canvasTransform"
    >
      <!-- Nodes -->
      <div
        v-for="node in nodes"
        :key="node._id"
        class="workflow-node absolute"
        :style="getNodeStyle(node)"
        @mousedown.stop="handleNodeMouseDown(node, $event)"
      >
        <div
          class="relative bg-white rounded-lg shadow-md border-2 transition-all cursor-move"
          :class="getNodeClass(node)"
          @click="selectNode(node)"
        >
          <!-- Node Content -->
          <div class="p-4">
            <div class="flex items-center gap-2 mb-2">
              <span
                class="px-2 py-0.5 text-xs font-semibold rounded"
                :class="node.node_type === 'TASK' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'"
              >
                {{ node.node_type }}
              </span>
            </div>
            <h4 class="font-semibold text-gray-900 mb-1">{{ node.name }}</h4>
            <p v-if="node.description" class="text-sm text-gray-600 line-clamp-2">
              {{ node.description }}
            </p>
          </div>

          <!-- Connection Handles -->
          <ConnectionHandle
            :node-id="node._id"
            position="left"
            type="input"
            :is-active="isConnectionTarget(node._id)"
            @start-connection="startConnection"
          />
          <ConnectionHandle
            :node-id="node._id"
            position="right"
            type="output"
            :is-active="isConnectionSource(node._id)"
            @start-connection="startConnection"
          />
        </div>
      </div>
    </div>

    <!-- Connection Editor (SVG overlay) -->
    <ConnectionEditor
      :workflow-id="workflowId"
      :version-id="versionId"
      :nodes="nodes"
      :connections="connections"
      @connection-created="handleConnectionCreated"
      @connection-updated="handleConnectionUpdated"
      @connection-deleted="handleConnectionDeleted"
    />

    <!-- Zoom Controls -->
    <div class="absolute bottom-4 right-4 flex flex-col gap-2 z-10">
      <button
        @click="zoomIn"
        class="w-10 h-10 bg-white rounded-lg shadow-md hover:bg-gray-50 flex items-center justify-center transition-colors"
        title="Zoom In"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
      </button>
      <button
        @click="zoomOut"
        class="w-10 h-10 bg-white rounded-lg shadow-md hover:bg-gray-50 flex items-center justify-center transition-colors"
        title="Zoom Out"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4" />
        </svg>
      </button>
      <button
        @click="resetZoom"
        class="w-10 h-10 bg-white rounded-lg shadow-md hover:bg-gray-50 flex items-center justify-center transition-colors text-xs font-semibold"
        title="Reset Zoom"
      >
        {{ Math.round(zoom * 100) }}%
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useNodeStore } from '../stores/node';
import { useConnectionStore } from '../stores/connection';
import ConnectionHandle from './ConnectionHandle.vue';
import ConnectionEditor from './ConnectionEditor.vue';

const props = defineProps({
  workflowId: {
    type: String,
    required: true
  },
  versionId: {
    type: String,
    required: true
  },
  nodes: {
    type: Array,
    default: () => []
  },
  connections: {
    type: Array,
    default: () => []
  }
});

const emit = defineEmits(['node-selected', 'node-moved']);

const nodeStore = useNodeStore();
const connectionStore = useConnectionStore();

const canvasContainer = ref(null);
const canvasContent = ref(null);

// Pan and Zoom state
const panX = ref(0);
const panY = ref(0);
const zoom = ref(1);
const isPanning = ref(false);
const panStart = ref({ x: 0, y: 0 });

// Node dragging state
const isDraggingNode = ref(false);
const draggedNode = ref(null);
const dragOffset = ref({ x: 0, y: 0 });

const canvasTransform = computed(() => ({
  transform: `translate(${panX.value}px, ${panY.value}px) scale(${zoom.value})`,
  transformOrigin: '0 0'
}));

const getNodeStyle = (node) => ({
  left: `${node.position_x}px`,
  top: `${node.position_y}px`,
  width: '200px'
});

const getNodeClass = (node) => {
  const isSelected = nodeStore.selectedNode?._id === node._id;
  return {
    'border-blue-500 shadow-lg': isSelected,
    'border-gray-300 hover:border-gray-400': !isSelected
  };
};

const isConnectionSource = (nodeId) => {
  return connectionStore.isCreating && 
         connectionStore.tempConnection?.from_node_id === nodeId;
};

const isConnectionTarget = (nodeId) => {
  return connectionStore.isCreating && 
         connectionStore.tempConnection?.from_node_id !== nodeId;
};

const selectNode = (node) => {
  nodeStore.selectNode(node);
  emit('node-selected', node);
};

const startConnection = ({ nodeId, position }) => {
  connectionStore.startConnectionCreation(nodeId, position);
};

const handleCanvasMouseDown = (event) => {
  if (event.target === canvasContainer.value || event.target === canvasContent.value) {
    isPanning.value = true;
    panStart.value = {
      x: event.clientX - panX.value,
      y: event.clientY - panY.value
    };
  }
};

const handleCanvasMouseMove = (event) => {
  if (isPanning.value) {
    panX.value = event.clientX - panStart.value.x;
    panY.value = event.clientY - panStart.value.y;
  } else if (isDraggingNode.value && draggedNode.value) {
    // Calculate new position in canvas space
    const canvasX = (event.clientX - panX.value) / zoom.value;
    const canvasY = (event.clientY - panY.value) / zoom.value;
    
    // Apply offset and allow negative positions (nodes can be anywhere on canvas)
    draggedNode.value.position_x = canvasX - dragOffset.value.x;
    draggedNode.value.position_y = canvasY - dragOffset.value.y;
  } else if (connectionStore.isCreating) {
    // Update temp connection position
    connectionStore.updateTempConnection({
      x: event.clientX,
      y: event.clientY
    });
  }
};

const handleCanvasMouseUp = async (event) => {
  // Handle connection completion
  if (connectionStore.isCreating) {
    const targetNode = getNodeAtPosition(event.clientX, event.clientY);
    
    if (targetNode && targetNode._id !== connectionStore.tempConnection.from_node_id) {
      try {
        await connectionStore.createConnection(
          props.workflowId,
          props.versionId,
          {
            from_node_id: connectionStore.tempConnection.from_node_id,
            to_node_id: targetNode._id,
            label: ''
          }
        );
        handleConnectionCreated();
      } catch (error) {
        console.error('Failed to create connection:', error.message);
      }
    }
    
    connectionStore.cancelConnectionCreation();
  }
  
  // Handle node dragging
  if (isDraggingNode.value && draggedNode.value) {
    try {
      await nodeStore.updateNode(
        props.workflowId,
        props.versionId,
        draggedNode.value._id,
        {
          position_x: draggedNode.value.position_x,
          position_y: draggedNode.value.position_y
        }
      );
      emit('node-moved', draggedNode.value);
    } catch (error) {
      console.error('Failed to update node position:', error);
    }
  }
  
  isPanning.value = false;
  isDraggingNode.value = false;
  draggedNode.value = null;
};

const getNodeAtPosition = (clientX, clientY) => {
  const x = (clientX - panX.value) / zoom.value;
  const y = (clientY - panY.value) / zoom.value;
  
  return props.nodes.find(node => {
    const nodeWidth = 200;
    const nodeHeight = 100;
    return x >= node.position_x && 
           x <= node.position_x + nodeWidth &&
           y >= node.position_y && 
           y <= node.position_y + nodeHeight;
  });
};

const handleNodeMouseDown = (node, event) => {
  event.stopPropagation(); // Prevent canvas panning
  isDraggingNode.value = true;
  draggedNode.value = node;
  
  // Calculate offset from mouse to node's top-left corner in canvas space
  const canvasX = (event.clientX - panX.value) / zoom.value;
  const canvasY = (event.clientY - panY.value) / zoom.value;
  
  dragOffset.value = {
    x: canvasX - node.position_x,
    y: canvasY - node.position_y
  };
};

const zoomIn = () => {
  zoom.value = Math.min(zoom.value + 0.1, 2);
};

const zoomOut = () => {
  zoom.value = Math.max(zoom.value - 0.1, 0.5);
};

const resetZoom = () => {
  zoom.value = 1;
  panX.value = 0;
  panY.value = 0;
};

const handleConnectionCreated = (connection) => {
  console.log('Connection created:', connection);
};

const handleConnectionUpdated = (connection) => {
  console.log('Connection updated:', connection);
};

const handleConnectionDeleted = (connectionId) => {
  console.log('Connection deleted:', connectionId);
};

onMounted(() => {
  // Center the canvas initially
  if (canvasContainer.value) {
    panX.value = canvasContainer.value.clientWidth / 2 - 100;
    panY.value = 50;
  }
});
</script>
