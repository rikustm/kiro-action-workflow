<template>
  <div v-if="loading" class="flex items-center justify-center h-screen">
    <div class="text-gray-500">Loading workflow...</div>
  </div>

  <div v-else-if="error" class="flex items-center justify-center h-screen">
    <div class="text-red-500">{{ error }}</div>
  </div>

  <div v-else class="flex flex-col h-screen">
    <!-- Header -->
    <header class="bg-white border-b border-gray-200 px-6 py-4">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-4">
          <button @click="goBack" class="text-gray-500 hover:text-gray-700">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <InlineEdit
            v-model="workflowTitle"
            :on-save="updateTitle"
            placeholder="Workflow Title"
            text-class="text-2xl font-semibold"
            input-class="text-2xl font-semibold"
          />
        </div>
        <div class="flex items-center gap-4">
          <span class="px-3 py-1 text-sm rounded-full" :class="statusClass">
            {{ currentVersion?.status || 'Draft' }}
          </span>
          <span class="text-sm text-gray-600">
            Version {{ currentVersion?.version_number || 1 }}
          </span>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <div class="flex flex-1 overflow-hidden">
      <!-- Left Sidebar: Metadata & Version History -->
      <aside class="w-64 bg-gray-50 border-r border-gray-200 overflow-y-auto p-4">
        <div class="space-y-6">
          <!-- Metadata -->
          <div>
            <h3 class="text-sm font-semibold text-gray-700 mb-3">Metadata</h3>
            <div class="space-y-2 text-sm">
              <div>
                <span class="text-gray-500">Owner:</span>
                <span class="ml-2 text-gray-900">{{ workflow?.owner || 'Unknown' }}</span>
              </div>
              <div>
                <span class="text-gray-500">Created:</span>
                <span class="ml-2 text-gray-900">{{ formatDate(workflow?.created_at) }}</span>
              </div>
              <div>
                <span class="text-gray-500">Updated:</span>
                <span class="ml-2 text-gray-900">{{ formatDate(workflow?.updated_at) }}</span>
              </div>
            </div>
          </div>

          <!-- Version History -->
          <div>
            <h3 class="text-sm font-semibold text-gray-700 mb-3">Version History</h3>
            <div class="space-y-2">
              <div
                v-for="version in versions"
                :key="version._id"
                @click="selectVersion(version)"
                class="p-2 rounded cursor-pointer hover:bg-gray-100"
                :class="{ 'bg-blue-50 border border-blue-200': version.id === currentVersion?.id }"
              >
                <div class="flex items-center justify-between">
                  <span class="text-sm font-medium">v{{ version.version_number }}</span>
                  <span class="text-xs px-2 py-0.5 rounded" :class="getVersionStatusClass(version.is_published)">
                    {{ version.is_published ? 'Published' : 'Draft' }}
                  </span>
                </div>
                <div class="text-xs text-gray-500 mt-1">
                  {{ formatDate(version.created_at) }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </aside>

      <!-- Center: Diagram Canvas -->
      <main class="flex-1 bg-gray-100 overflow-hidden">
              <div class="absolute top-4 left-4 z-10">
          <AddNodeMenu
            v-if="workflow && currentVersion"
            :workflow-id="workflow.id"
            :version-id="currentVersion.id"
            :task-types="taskTypes"
            @node-created="handleNodeCreated"
          />
        </div>
        <WorkflowCanvas
          v-if="workflow && currentVersion"
          :workflow-id="workflow.id"
          :version-id="currentVersion.id"
          :nodes="nodes"
          :connections="connections"
          @node-selected="handleNodeSelected"
          @node-moved="handleNodeMoved"
        />
      </main>

      <!-- Right Panel: Node Editor (contextual) -->
      <aside class="w-80 bg-white border-l border-gray-200 overflow-y-auto">
        <NodeEditorPanel
          :node="selectedNode"
          :task-types="taskTypes"
          @close="clearNodeSelection"
          @update="handleNodeUpdate"
          @delete="handleNodeDelete"
        />
      </aside>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useWorkflowStore } from '../stores/workflow';
import { useNodeStore } from '../stores/node';
import { useConnectionStore } from '../stores/connection';
import { useTaskTypeStore } from '../stores/taskType';
import NodeEditorPanel from '../components/NodeEditorPanel.vue';
import InlineEdit from '../components/InlineEdit.vue';
import WorkflowCanvas from '../components/WorkflowCanvas.vue';
import AddNodeMenu from '../components/AddNodeMenu.vue';

const route = useRoute();
const router = useRouter();
const workflowStore = useWorkflowStore();
const nodeStore = useNodeStore();
const connectionStore = useConnectionStore();
const taskTypeStore = useTaskTypeStore();

const loading = ref(true);
const error = ref(null);
const workflow = ref(null);
const currentVersion = ref(null);
const versions = ref([]);
const workflowTitle = ref('');
const taskTypes = ref([]);
const nodes = computed(() => nodeStore.nodes);
const connections = computed(() => connectionStore.connections);
const selectedNode = computed(() => nodeStore.selectedNode);

const statusClass = computed(() => {
  const status = currentVersion.value?.status || 'draft';
  return {
    'bg-yellow-100 text-yellow-800': status === 'draft',
    'bg-green-100 text-green-800': status === 'published',
    'bg-gray-100 text-gray-800': status === 'archived'
  };
});

const getVersionStatusClass = (isPublished) => {
  return {
    'bg-yellow-100 text-yellow-700': !isPublished,
    'bg-green-100 text-green-700': isPublished
  };
};

const formatDate = (date) => {
  if (!date) return 'N/A';
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

const goBack = () => {
  router.push('/workflows');
};

const updateTitle = async () => {
  if (workflowTitle.value !== workflow.value?.title) {
    try {
      await workflowStore.updateWorkflow(workflow.value.id, { title: workflowTitle.value });
      workflow.value.title = workflowTitle.value;
    } catch (err) {
      error.value = 'Failed to update title';
    }
  }
};

const selectVersion = (version) => {
  currentVersion.value = version;
};

const clearNodeSelection = () => {
  nodeStore.clearSelection();
};

const handleNodeUpdate = async (updates) => {
  try {
    await nodeStore.updateNode(workflow.value.id, currentVersion.value.id, updates._id, updates);
  } catch (err) {
    error.value = 'Failed to update node';
  }
};

const handleNodeDelete = async (nodeId) => {
  try {
    await nodeStore.deleteNode(workflow.value.id, currentVersion.value.id, nodeId);
  } catch (err) {
    error.value = 'Failed to delete node';
  }
};

const handleNodeSelected = (node) => {
  nodeStore.selectNode(node);
};

const handleNodeMoved = (node) => {
  console.log('Node moved:', node);
const handleNodeCreated = async (nodeData) => {
  try {
    await nodeStore.createNode(workflow.value.id, currentVersion.value.id, nodeData);
  } catch (err) {
    error.value = err.message || 'Failed to create node';
  }
};

onMounted(async () => {
  try {
    const workflowId = route.params.id;
    
    // Fetch workflow details
    workflow.value = await workflowStore.fetchWorkflow(workflowId);
    workflowTitle.value = workflow.value.title;
    
    // Fetch versions
    versions.value = await workflowStore.fetchVersions(workflowId);
    
    // Set current version (latest or specified)
    if (route.query.version) {
      currentVersion.value = versions.value.find(v => v.version_number === parseInt(route.query.version));
    } else {
      currentVersion.value = versions.value[0]; // Latest version
    }
    
    // Fetch task types
    await taskTypeStore.fetchTaskTypes();
    taskTypes.value = taskTypeStore.taskTypes;
    
    // Fetch nodes for current version
    if (currentVersion.value) {
      await nodeStore.fetchNodes(workflowId, currentVersion.value.id);
      await connectionStore.fetchConnections(workflowId, currentVersion.value.id);
    }
    
    loading.value = false;
  } catch (err) {
    error.value = 'Failed to load workflow';
    loading.value = false;
  }
});
</script>
