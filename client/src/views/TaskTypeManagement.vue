<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useTaskTypeStore } from '../stores/taskType';
import { useAuthStore } from '../stores/auth';
import TaskTypeForm from '../components/TaskTypeForm.vue';

const router = useRouter();
const taskTypeStore = useTaskTypeStore();
const authStore = useAuthStore();

const showModal = ref(false);
const modalMode = ref('create'); // 'create' or 'edit'
const selectedTaskType = ref(null);
const showActiveOnly = ref(false);

// Redirect if not admin
if (!authStore.isAdmin) {
  router.push('/workflows');
}

onMounted(() => {
  taskTypeStore.fetchTaskTypes(false);
});

const filteredTaskTypes = computed(() => {
  if (showActiveOnly.value) {
    return taskTypeStore.taskTypes.filter(t => t.is_active);
  }
  return taskTypeStore.taskTypes;
});

const openCreateModal = () => {
  modalMode.value = 'create';
  selectedTaskType.value = null;
  showModal.value = true;
};

const openEditModal = (taskType) => {
  modalMode.value = 'edit';
  selectedTaskType.value = taskType;
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
  selectedTaskType.value = null;
};

const handleSubmit = async (formData) => {
  try {
    if (modalMode.value === 'create') {
      await taskTypeStore.createTaskType(formData);
    } else {
      await taskTypeStore.updateTaskType(selectedTaskType.value._id, formData);
    }
    closeModal();
  } catch (error) {
    console.error('Failed to save task type:', error);
  }
};

const handleDeactivate = async (taskType) => {
  if (confirm(`Are you sure you want to deactivate "${taskType.name}"? Existing tasks will remain readable.`)) {
    try {
      await taskTypeStore.deactivateTaskType(taskType._id);
    } catch (error) {
      alert('Failed to deactivate task type');
    }
  }
};

const handleActivate = async (taskType) => {
  try {
    await taskTypeStore.updateTaskType(taskType._id, { is_active: true });
  } catch (error) {
    alert('Failed to activate task type');
  }
};

const goBack = () => {
  router.push('/workflows');
};
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <nav class="bg-white shadow-sm">
      <div class="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        <div class="flex items-center gap-4">
          <button
            @click="goBack"
            class="text-gray-600 hover:text-gray-900"
          >
            ← Back
          </button>
          <h1 class="text-xl font-bold text-gray-800">Task Type Management</h1>
        </div>
        <div class="flex items-center gap-2">
          <span class="text-sm text-gray-600">Admin</span>
        </div>
      </div>
    </nav>

    <div class="max-w-7xl mx-auto px-4 py-8">
      <div class="mb-6 flex justify-between items-center">
        <div>
          <h2 class="text-2xl font-bold text-gray-900">Task Types</h2>
          <p class="mt-1 text-sm text-gray-500">
            Define and manage task types with custom field schemas
          </p>
        </div>
        <button
          @click="openCreateModal"
          class="px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Create Task Type
        </button>
      </div>

      <div class="mb-4">
        <label class="flex items-center space-x-2 cursor-pointer">
          <input
            v-model="showActiveOnly"
            type="checkbox"
            class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <span class="text-sm text-gray-700">Show active only</span>
        </label>
      </div>

      <div v-if="taskTypeStore.loading" class="text-center py-12">
        <div class="text-gray-500">Loading task types...</div>
      </div>

      <div v-else-if="filteredTaskTypes.length === 0" class="text-center py-12 bg-white rounded-lg border border-gray-200">
        <div class="text-gray-500">No task types found. Create one to get started.</div>
      </div>

      <div v-else class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div
          v-for="taskType in filteredTaskTypes"
          :key="taskType._id"
          class="bg-white rounded-lg border border-gray-200 p-5 hover:shadow-md transition-shadow"
          :class="{ 'opacity-60': !taskType.is_active }"
        >
          <div class="flex justify-between items-start mb-3">
            <div class="flex items-center gap-2">
              <span class="text-2xl">{{ taskType.icon || '📋' }}</span>
              <div>
                <h3 class="font-semibold text-gray-900">{{ taskType.name }}</h3>
                <span
                  v-if="!taskType.is_active"
                  class="text-xs text-red-600 font-medium"
                >
                  Inactive
                </span>
              </div>
            </div>
          </div>

          <p v-if="taskType.description" class="text-sm text-gray-600 mb-4">
            {{ taskType.description }}
          </p>

          <div class="mb-4">
            <div class="text-xs font-medium text-gray-500 mb-2">
              Fields ({{ taskType.field_schema?.length || 0 }})
            </div>
            <div class="flex flex-wrap gap-1">
              <span
                v-for="field in taskType.field_schema?.slice(0, 5)"
                :key="field.name"
                class="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded"
              >
                {{ field.label }}
              </span>
              <span
                v-if="taskType.field_schema?.length > 5"
                class="px-2 py-1 text-xs text-gray-500"
              >
                +{{ taskType.field_schema.length - 5 }} more
              </span>
            </div>
          </div>

          <div class="flex gap-2 pt-3 border-t border-gray-200">
            <button
              @click="openEditModal(taskType)"
              class="flex-1 px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded-md"
            >
              Edit
            </button>
            <button
              v-if="taskType.is_active"
              @click="handleDeactivate(taskType)"
              class="flex-1 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-md"
            >
              Deactivate
            </button>
            <button
              v-else
              @click="handleActivate(taskType)"
              class="flex-1 px-3 py-1.5 text-sm text-green-600 hover:bg-green-50 rounded-md"
            >
              Activate
            </button>
          </div>
        </div>
      </div>
    </div>

    <div v-if="showModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div class="bg-white rounded-lg shadow-xl max-w-3xl w-full p-6 my-8">
        <h3 class="text-lg font-bold text-gray-900 mb-6">
          {{ modalMode === 'create' ? 'Create Task Type' : 'Edit Task Type' }}
        </h3>

        <TaskTypeForm
          :task-type="selectedTaskType"
          :loading="taskTypeStore.loading"
          @submit="handleSubmit"
          @cancel="closeModal"
        />
      </div>
    </div>
  </div>
</template>
