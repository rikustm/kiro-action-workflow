<template>
  <div class="relative">
    <!-- Add Node Button -->
    <button
      @click="toggleMenu"
      class="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
    >
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
      </svg>
      Add Node
    </button>

    <!-- Dropdown Menu -->
    <div
      v-if="showMenu"
      class="absolute top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50"
    >
      <button
        @click="selectNodeType('TASK')"
        class="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center gap-3 border-b border-gray-100"
      >
        <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
        <div>
          <div class="font-medium text-gray-900">Add Task</div>
          <div class="text-xs text-gray-500">Execute an action</div>
        </div>
      </button>

      <button
        @click="selectNodeType('DECISION')"
        class="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center gap-3"
      >
        <svg class="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <div>
          <div class="font-medium text-gray-900">Add Decision</div>
          <div class="text-xs text-gray-500">Conditional branch</div>
        </div>
      </button>
    </div>

    <!-- Modal for Task Type Selection -->
    <div
      v-if="showTaskTypeModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      @click.self="closeModal"
    >
      <div class="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-hidden flex flex-col">
        <div class="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h3 class="text-lg font-semibold text-gray-900">Create New Task</h3>
          <button
            @click="closeModal"
            class="text-gray-400 hover:text-gray-600"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div class="p-6 overflow-y-auto">
          <TaskTypeSelector
            :task-types="taskTypes"
            @create="handleCreateTask"
            @cancel="closeModal"
          />
        </div>
      </div>
    </div>

    <!-- Modal for Decision Creation -->
    <div
      v-if="showDecisionModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      @click.self="closeModal"
    >
      <div class="bg-white rounded-lg shadow-xl max-w-lg w-full mx-4">
        <div class="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h3 class="text-lg font-semibold text-gray-900">Create Decision Node</h3>
          <button
            @click="closeModal"
            class="text-gray-400 hover:text-gray-600"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div class="p-6 space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Decision Name
            </label>
            <input
              v-model="decisionName"
              type="text"
              placeholder="Enter decision name"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Decision Question
            </label>
            <textarea
              v-model="decisionQuestion"
              placeholder="What condition should be evaluated?"
              rows="3"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Description (optional)
            </label>
            <textarea
              v-model="decisionDescription"
              placeholder="Enter description"
              rows="2"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div class="flex justify-end gap-2 pt-4 border-t border-gray-200">
            <button
              @click="closeModal"
              class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              @click="handleCreateDecision"
              :disabled="!canCreateDecision"
              class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              Create Decision
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Error Message -->
    <div
      v-if="error"
      class="fixed bottom-4 right-4 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg shadow-lg z-50"
    >
      <div class="flex items-center gap-2">
        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
        </svg>
        <span>{{ error }}</span>
      </div>
    </div>

    <!-- Success Message -->
    <div
      v-if="success"
      class="fixed bottom-4 right-4 bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg shadow-lg z-50"
    >
      <div class="flex items-center gap-2">
        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
        </svg>
        <span>{{ success }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import TaskTypeSelector from './TaskTypeSelector.vue';

const props = defineProps({
  workflowId: {
    type: String,
    required: true
  },
  versionId: {
    type: String,
    required: true
  },
  taskTypes: {
    type: Array,
    required: true
  }
});

const emit = defineEmits(['node-created']);

const showMenu = ref(false);
const showTaskTypeModal = ref(false);
const showDecisionModal = ref(false);
const decisionName = ref('');
const decisionQuestion = ref('');
const decisionDescription = ref('');
const error = ref(null);
const success = ref(null);

const canCreateDecision = computed(() => {
  return decisionName.value.trim().length > 0;
});

const toggleMenu = () => {
  showMenu.value = !showMenu.value;
};

const selectNodeType = (type) => {
  showMenu.value = false;
  if (type === 'TASK') {
    showTaskTypeModal.value = true;
  } else if (type === 'DECISION') {
    showDecisionModal.value = true;
  }
};

const closeModal = () => {
  showTaskTypeModal.value = false;
  showDecisionModal.value = false;
  decisionName.value = '';
  decisionQuestion.value = '';
  decisionDescription.value = '';
  error.value = null;
};

const handleCreateTask = async (taskData) => {
  try {
    error.value = null;
    
    // Calculate position (simple auto-positioning)
    const position_x = Math.floor(Math.random() * 400) + 100;
    const position_y = Math.floor(Math.random() * 300) + 100;

    const nodeData = {
      ...taskData,
      position_x,
      position_y
    };

    emit('node-created', nodeData);
    
    success.value = 'Task created successfully';
    setTimeout(() => {
      success.value = null;
    }, 3000);
    
    closeModal();
  } catch (err) {
    error.value = err.message || 'Failed to create task';
    setTimeout(() => {
      error.value = null;
    }, 5000);
  }
};

const handleCreateDecision = async () => {
  if (!canCreateDecision.value) return;

  try {
    error.value = null;
    
    // Calculate position (simple auto-positioning)
    const position_x = Math.floor(Math.random() * 400) + 100;
    const position_y = Math.floor(Math.random() * 300) + 100;

    const nodeData = {
      node_type: 'DECISION',
      name: decisionName.value.trim(),
      description: decisionDescription.value.trim(),
      decision_question: decisionQuestion.value.trim(),
      position_x,
      position_y
    };

    emit('node-created', nodeData);
    
    success.value = 'Decision node created successfully';
    setTimeout(() => {
      success.value = null;
    }, 3000);
    
    closeModal();
  } catch (err) {
    error.value = err.message || 'Failed to create decision node';
    setTimeout(() => {
      error.value = null;
    }, 5000);
  }
};

// Close menu when clicking outside
const handleClickOutside = (event) => {
  if (showMenu.value && !event.target.closest('.relative')) {
    showMenu.value = false;
  }
};

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});
</script>
