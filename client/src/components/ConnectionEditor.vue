<template>
  <div class="connection-editor">
    <!-- SVG Canvas for Connections -->
    <svg
      ref="svgCanvas"
      class="absolute inset-0 w-full h-full pointer-events-none"
      style="z-index: 1;"
    >
      <defs>
        <marker
          id="arrowhead"
          markerWidth="10"
          markerHeight="10"
          refX="9"
          refY="3"
          orient="auto"
          markerUnits="strokeWidth"
        >
          <path d="M0,0 L0,6 L9,3 z" fill="#6b7280" />
        </marker>
        <marker
          id="arrowhead-selected"
          markerWidth="10"
          markerHeight="10"
          refX="9"
          refY="3"
          orient="auto"
          markerUnits="strokeWidth"
        >
          <path d="M0,0 L0,6 L9,3 z" fill="#3b82f6" />
        </marker>
        <marker
          id="arrowhead-temp"
          markerWidth="10"
          markerHeight="10"
          refX="9"
          refY="3"
          orient="auto"
          markerUnits="strokeWidth"
        >
          <path d="M0,0 L0,6 L9,3 z" fill="#93c5fd" />
        </marker>
      </defs>

      <!-- Existing Connections -->
      <g
        v-for="connection in connections"
        :key="connection._id"
        class="connection-group pointer-events-auto cursor-pointer"
        @click="selectConnection(connection)"
      >
        <path
          :d="getConnectionPath(connection)"
          :stroke="isSelected(connection) ? '#3b82f6' : '#6b7280'"
          :stroke-width="isSelected(connection) ? 3 : 2"
          fill="none"
          :marker-end="isSelected(connection) ? 'url(#arrowhead-selected)' : 'url(#arrowhead)'"
          class="transition-all"
        />
        <!-- Invisible wider path for easier clicking -->
        <path
          :d="getConnectionPath(connection)"
          stroke="transparent"
          stroke-width="12"
          fill="none"
        />
        
        <!-- Connection Label -->
        <text
          v-if="connection.label"
          :x="getConnectionMidpoint(connection).x"
          :y="getConnectionMidpoint(connection).y"
          text-anchor="middle"
          class="text-xs fill-gray-700 pointer-events-none select-none"
          :class="{ 'font-semibold fill-blue-600': isSelected(connection) }"
        >
          {{ connection.label }}
        </text>
      </g>

      <!-- Temporary Connection (while dragging) -->
      <path
        v-if="connectionStore.isCreating && connectionStore.tempConnection"
        :d="getTempConnectionPath()"
        stroke="#93c5fd"
        stroke-width="2"
        stroke-dasharray="5,5"
        fill="none"
        marker-end="url(#arrowhead-temp)"
        class="pointer-events-none"
      />
    </svg>

    <!-- Connection Label Editor Modal -->
    <div
      v-if="showLabelEditor && selectedConnection"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      @click.self="closeLabelEditor"
    >
      <div class="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h3 class="text-lg font-semibold mb-4">Edit Connection</h3>
        
        <div class="space-y-4">
          <!-- Label Input -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Branch Label
            </label>
            <input
              v-model="editingLabel"
              type="text"
              placeholder="e.g., Yes, No, Skip"
              class="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              @keydown.enter="saveLabel"
              @keydown.esc="closeLabelEditor"
            />
            <p class="text-xs text-gray-500 mt-1">
              Optional label for decision branches
            </p>
          </div>

          <!-- Connection Info -->
          <div class="text-sm text-gray-600 space-y-1 pt-2 border-t">
            <div>
              <span class="font-medium">From:</span>
              {{ getNodeName(selectedConnection.from_node_id) }}
            </div>
            <div>
              <span class="font-medium">To:</span>
              {{ getNodeName(selectedConnection.to_node_id) }}
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex gap-3 justify-between mt-6">
          <button
            @click="confirmDelete"
            class="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
          >
            Delete
          </button>
          <div class="flex gap-3">
            <button
              @click="closeLabelEditor"
              class="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              @click="saveLabel"
              class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div
      v-if="showDeleteConfirm"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      @click.self="showDeleteConfirm = false"
    >
      <div class="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h3 class="text-lg font-semibold mb-2">Delete Connection?</h3>
        <p class="text-gray-600 mb-4">
          Are you sure you want to delete this connection? This action cannot be undone.
        </p>
        <div class="flex gap-3 justify-end">
          <button
            @click="showDeleteConfirm = false"
            class="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            @click="deleteConnection"
            class="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useConnectionStore } from '../stores/connection';

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

const emit = defineEmits(['connection-created', 'connection-updated', 'connection-deleted']);

const connectionStore = useConnectionStore();
const svgCanvas = ref(null);
const showLabelEditor = ref(false);
const showDeleteConfirm = ref(false);
const editingLabel = ref('');
const selectedConnection = computed(() => connectionStore.selectedConnection);

const isSelected = (connection) => {
  return selectedConnection.value?._id === connection._id;
};

const getNodePosition = (nodeId) => {
  const node = props.nodes.find(n => n._id === nodeId);
  if (!node) return { x: 0, y: 0 };
  
  // Assuming nodes have position_x and position_y
  // Add offset for node center (assuming 200x80 node size)
  return {
    x: node.position_x + 100,
    y: node.position_y + 40
  };
};

const getNodeName = (nodeId) => {
  const node = props.nodes.find(n => n._id === nodeId);
  return node?.name || 'Unknown';
};

const getConnectionPath = (connection) => {
  const start = getNodePosition(connection.from_node_id);
  const end = getNodePosition(connection.to_node_id);
  
  return createCurvedPath(start, end);
};

const getTempConnectionPath = () => {
  if (!connectionStore.tempConnection) return '';
  
  const start = connectionStore.tempConnection.startPosition;
  const end = connectionStore.tempConnection.currentPosition;
  
  return createCurvedPath(start, end);
};

const createCurvedPath = (start, end) => {
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  
  // Create a smooth bezier curve
  const controlPointOffset = Math.abs(dx) * 0.5;
  
  return `M ${start.x} ${start.y} C ${start.x + controlPointOffset} ${start.y}, ${end.x - controlPointOffset} ${end.y}, ${end.x} ${end.y}`;
};

const getConnectionMidpoint = (connection) => {
  const start = getNodePosition(connection.from_node_id);
  const end = getNodePosition(connection.to_node_id);
  
  return {
    x: (start.x + end.x) / 2,
    y: (start.y + end.y) / 2 - 10 // Offset above the line
  };
};

const selectConnection = (connection) => {
  connectionStore.selectConnection(connection);
  editingLabel.value = connection.label || '';
  showLabelEditor.value = true;
};

const closeLabelEditor = () => {
  showLabelEditor.value = false;
  setTimeout(() => {
    connectionStore.clearSelection();
  }, 300);
};

const saveLabel = async () => {
  if (!selectedConnection.value) return;
  
  try {
    await connectionStore.updateConnection(
      props.workflowId,
      props.versionId,
      selectedConnection.value._id,
      { label: editingLabel.value }
    );
    
    emit('connection-updated', selectedConnection.value);
    closeLabelEditor();
  } catch (error) {
    console.error('Failed to update connection:', error);
  }
};

const confirmDelete = () => {
  showDeleteConfirm.value = true;
};

const deleteConnection = async () => {
  if (!selectedConnection.value) return;
  
  try {
    await connectionStore.deleteConnection(
      props.workflowId,
      props.versionId,
      selectedConnection.value._id
    );
    
    emit('connection-deleted', selectedConnection.value._id);
    showDeleteConfirm.value = false;
    closeLabelEditor();
  } catch (error) {
    console.error('Failed to delete connection:', error);
  }
};

</script>
