<template>
  <div v-if="node" class="h-full flex flex-col">
    <!-- Header -->
    <div class="flex items-center justify-between p-4 border-b border-gray-200">
      <div class="flex items-center gap-2">
        <span class="px-2 py-1 text-xs font-semibold rounded" :class="nodeTypeClass">
          {{ node.node_type }}
        </span>
        <h3 class="text-lg font-semibold">Edit Node</h3>
      </div>
      <button @click="$emit('close')" class="text-gray-400 hover:text-gray-600">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>

    <!-- Content -->
    <div class="flex-1 overflow-y-auto p-4 space-y-4">
      <!-- Node Name -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Name</label>
        <InlineEdit
          v-model="localNode.name"
          :on-save="(value) => updateNode({ name: value })"
          placeholder="Node name"
          text-class="text-base"
        />
      </div>

      <!-- Node Description -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Description</label>
        <InlineEdit
          v-model="localNode.description"
          :on-save="(value) => updateNode({ description: value })"
          type="textarea"
          :rows="3"
          placeholder="Node description"
        />
      </div>

      <!-- Task Node Fields -->
      <div v-if="node.node_type === 'TASK'">
        <!-- Task Type -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Task Type</label>
          <select
            v-model="localNode.task_type_id"
            @change="handleTaskTypeChange"
            class="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select task type</option>
            <option v-for="type in taskTypes" :key="type._id" :value="type._id">
              {{ type.name }}
            </option>
          </select>
        </div>

        <!-- Custom Fields -->
        <TaskFieldEditor
          v-if="selectedTaskType"
          :fields="selectedTaskType.field_schema"
          :values="localNode.custom_fields || {}"
          @update="updateCustomFields"
        />
      </div>

      <!-- Decision Node Fields -->
      <div v-if="node.node_type === 'DECISION'">
        <label class="block text-sm font-medium text-gray-700 mb-1">Decision Question</label>
        <InlineEdit
          v-model="localNode.decision_question"
          :on-save="(value) => updateNode({ decision_question: value })"
          type="textarea"
          :rows="2"
          placeholder="What decision needs to be made?"
        />
      </div>

      <!-- Position Info -->
      <div class="pt-4 border-t border-gray-200">
        <h4 class="text-sm font-medium text-gray-700 mb-2">Position</h4>
        <div class="text-sm text-gray-600 space-y-1">
          <div>X: {{ node.position_x || 0 }}</div>
          <div>Y: {{ node.position_y || 0 }}</div>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <div class="p-4 border-t border-gray-200">
      <button
        @click="confirmDelete"
        class="w-full px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
      >
        Delete Node
      </button>
    </div>

    <!-- Delete Confirmation Modal -->
    <div
      v-if="showDeleteConfirm"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      @click.self="showDeleteConfirm = false"
    >
      <div class="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h3 class="text-lg font-semibold mb-2">Delete Node?</h3>
        <p class="text-gray-600 mb-4">
          Are you sure you want to delete "{{ node.name }}"? This action cannot be undone.
        </p>
        <div class="flex gap-3 justify-end">
          <button
            @click="showDeleteConfirm = false"
            class="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            @click="deleteNode"
            class="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  </div>

  <div v-else class="h-full flex items-center justify-center text-gray-400">
    <div class="text-center">
      <svg class="w-12 h-12 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
      </svg>
      <p class="text-sm">Select a node to edit</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import InlineEdit from './InlineEdit.vue';
import TaskFieldEditor from './TaskFieldEditor.vue';

const props = defineProps({
  node: {
    type: Object,
    default: null
  },
  taskTypes: {
    type: Array,
    default: () => []
  }
});

const emit = defineEmits(['close', 'update', 'delete']);

const localNode = ref({});
const showDeleteConfirm = ref(false);

const nodeTypeClass = computed(() => {
  return props.node?.node_type === 'TASK'
    ? 'bg-blue-100 text-blue-800'
    : 'bg-purple-100 text-purple-800';
});

const selectedTaskType = computed(() => {
  if (!localNode.value.task_type_id) return null;
  return props.taskTypes.find(t => t._id === localNode.value.task_type_id);
});

const updateNode = async (updates) => {
  Object.assign(localNode.value, updates);
  emit('update', { ...localNode.value, ...updates });
};

const handleTaskTypeChange = () => {
  updateNode({ 
    task_type_id: localNode.value.task_type_id,
    custom_fields: {}
  });
};

const updateCustomFields = (fields) => {
  updateNode({ custom_fields: fields });
};

const confirmDelete = () => {
  showDeleteConfirm.value = true;
};

const deleteNode = () => {
  emit('delete', props.node._id);
  showDeleteConfirm.value = false;
};

watch(() => props.node, (newNode) => {
  if (newNode) {
    localNode.value = { ...newNode };
  }
}, { immediate: true, deep: true });
</script>
