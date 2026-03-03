<template>
  <div class="h-full flex flex-col bg-white">
    <!-- Header -->
    <div class="px-4 py-3 border-b border-gray-200">
      <h3 class="text-sm font-semibold text-gray-700">Workflow Outline</h3>
    </div>

    <!-- Content -->
    <div class="flex-1 overflow-y-auto p-4">
      <div v-if="loading" class="text-sm text-gray-500">Loading outline...</div>
      
      <div v-else-if="error" class="text-sm text-red-500">{{ error }}</div>
      
      <div v-else-if="outlineTree.length === 0" class="text-sm text-gray-400">
        No nodes in workflow
      </div>
      
      <div v-else class="space-y-1">
        <OutlineNode
          v-for="node in outlineTree"
          :key="node.id"
          :node="node"
          :depth="0"
          :selected-node-id="selectedNodeId"
          @select="handleNodeSelect"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, watch } from 'vue';
import { useNodeStore } from '../stores/node';
import { useConnectionStore } from '../stores/connection';
import OutlineNode from './OutlineNode.vue';

const props = defineProps({
  workflowId: {
    type: String,
    required: true
  },
  versionId: {
    type: String,
    required: true
  }
});

const emit = defineEmits(['node-select', 'node-highlight']);

const nodeStore = useNodeStore();
const connectionStore = useConnectionStore();

const loading = computed(() => nodeStore.loading || connectionStore.loading);
const error = computed(() => nodeStore.error || connectionStore.error);
const selectedNodeId = computed(() => nodeStore.selectedNode?._id);

// Build outline tree structure from nodes and connections
const outlineTree = computed(() => {
  const nodes = nodeStore.nodes;
  const connections = connectionStore.connections;
  
  if (!nodes.length) return [];
  
  // Build adjacency map
  const childrenMap = new Map();
  connections.forEach(conn => {
    const fromId = conn.from_node_id;
    if (!childrenMap.has(fromId)) {
      childrenMap.set(fromId, []);
    }
    childrenMap.get(fromId).push({
      nodeId: conn.to_node_id,
      label: conn.label
    });
  });
  
  // Find root nodes (nodes with no incoming connections)
  const nodeIds = new Set(nodes.map(n => n._id));
  const targetIds = new Set(connections.map(c => c.to_node_id));
  const rootIds = [...nodeIds].filter(id => !targetIds.has(id));
  
  // If no clear root, use all nodes without parents
  const roots = rootIds.length > 0 
    ? nodes.filter(n => rootIds.includes(n._id))
    : nodes.filter(n => !targetIds.has(n._id));
  
  // Build tree recursively
  const buildTree = (node, visited = new Set()) => {
    if (visited.has(node._id)) {
      return null; // Prevent cycles
    }
    
    visited.add(node._id);
    
    const children = childrenMap.get(node._id) || [];
    const childNodes = children
      .map(child => {
        const childNode = nodes.find(n => n._id === child.nodeId);
        if (!childNode) return null;
        
        const subtree = buildTree(childNode, new Set(visited));
        return subtree ? {
          ...subtree,
          branchLabel: child.label
        } : null;
      })
      .filter(Boolean);
    
    return {
      id: node._id,
      name: node.name,
      type: node.node_type,
      description: node.description,
      children: childNodes,
      branchLabel: null
    };
  };
  
  return roots.map(root => buildTree(root)).filter(Boolean);
});

const handleNodeSelect = (nodeId) => {
  const node = nodeStore.nodes.find(n => n._id === nodeId);
  if (node) {
    nodeStore.selectNode(node);
    emit('node-select', node);
    emit('node-highlight', nodeId);
  }
};

// Watch for workflow/version changes
watch(
  () => [props.workflowId, props.versionId],
  async ([workflowId, versionId]) => {
    if (workflowId && versionId) {
      try {
        await Promise.all([
          nodeStore.fetchNodes(workflowId, versionId),
          connectionStore.fetchConnections(workflowId, versionId)
        ]);
      } catch (err) {
        console.error('Failed to load outline data:', err);
      }
    }
  },
  { immediate: true }
);
</script>
