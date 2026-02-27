<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useWorkflowStore } from '../stores/workflow';
import { useAuthStore } from '../stores/auth';
import WorkflowTable from '../components/WorkflowTable.vue';

const router = useRouter();
const workflowStore = useWorkflowStore();
const authStore = useAuthStore();

const showCreateModal = ref(false);
const newWorkflowTitle = ref('');
const newWorkflowDescription = ref('');
const createError = ref('');

onMounted(() => {
  workflowStore.fetchWorkflows();
});

const handleLogout = () => {
  authStore.logout();
  router.push('/login');
};

const openCreateModal = () => {
  showCreateModal.value = true;
  newWorkflowTitle.value = '';
  newWorkflowDescription.value = '';
  createError.value = '';
};

const closeCreateModal = () => {
  showCreateModal.value = false;
};

const handleCreate = async () => {
  createError.value = '';

  if (!newWorkflowTitle.value.trim()) {
    createError.value = 'Title is required';
    return;
  }

  try {
    const workflow = await workflowStore.createWorkflow(
      newWorkflowTitle.value,
      newWorkflowDescription.value
    );
    closeCreateModal();
    router.push(`/workflows/${workflow.id}`);
  } catch (error) {
    createError.value = error.message;
  }
};

const handleDuplicate = async (workflowId) => {
  if (confirm('Are you sure you want to duplicate this workflow?')) {
    try {
      await workflowStore.duplicateWorkflow(workflowId);
    } catch (error) {
      alert(error.message);
    }
  }
};

const handleArchive = async (workflowId) => {
  if (confirm('Are you sure you want to archive this workflow?')) {
    try {
      await workflowStore.archiveWorkflow(workflowId);
    } catch (error) {
      alert(error.message);
    }
  }
};
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <nav class="bg-white shadow-sm">
      <div class="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        <h1 class="text-xl font-bold text-gray-800">Workflow Documentation</h1>
        <button
          @click="handleLogout"
          class="px-4 py-2 text-sm text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md"
        >
          Logout
        </button>
      </div>
    </nav>

    <div class="max-w-7xl mx-auto px-4 py-8">
      <div class="mb-6 flex justify-between items-center">
        <div>
          <h2 class="text-2xl font-bold text-gray-900">Workflows</h2>
          <p class="mt-1 text-sm text-gray-500">
            Manage and document your workflow processes
          </p>
        </div>
        <button
          @click="openCreateModal"
          class="px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Create Workflow
        </button>
      </div>

      <div class="mb-4 flex gap-4">
        <select
          v-model="workflowStore.filters.status"
          @change="workflowStore.setFilter('status', $event.target.value)"
          class="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">All Statuses</option>
          <option value="Draft">Draft</option>
          <option value="Published">Published</option>
          <option value="Archived">Archived</option>
        </select>
      </div>

      <WorkflowTable
        :workflows="workflowStore.workflows"
        :loading="workflowStore.loading"
        @duplicate="handleDuplicate"
        @archive="handleArchive"
      />

      <div v-if="workflowStore.pagination.pages > 1" class="mt-4 flex justify-center gap-2">
        <button
          v-for="page in workflowStore.pagination.pages"
          :key="page"
          @click="workflowStore.setPage(page)"
          class="px-3 py-1 rounded-md"
          :class="page === workflowStore.pagination.page ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'"
        >
          {{ page }}
        </button>
      </div>
    </div>

    <div v-if="showCreateModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div class="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <h3 class="text-lg font-bold text-gray-900 mb-4">Create New Workflow</h3>

        <div class="space-y-4">
          <div>
            <label for="title" class="block text-sm font-medium text-gray-700 mb-1">
              Title
            </label>
            <input
              id="title"
              v-model="newWorkflowTitle"
              type="text"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter workflow title"
            />
          </div>

          <div>
            <label for="description" class="block text-sm font-medium text-gray-700 mb-1">
              Description (optional)
            </label>
            <textarea
              id="description"
              v-model="newWorkflowDescription"
              rows="3"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter workflow description"
            />
          </div>

          <div v-if="createError" class="text-red-600 text-sm">
            {{ createError }}
          </div>
        </div>

        <div class="mt-6 flex justify-end gap-3">
          <button
            @click="closeCreateModal"
            class="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
          >
            Cancel
          </button>
          <button
            @click="handleCreate"
            class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Create
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
