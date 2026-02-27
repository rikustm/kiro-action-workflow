<script setup>
import { computed } from 'vue';
import { useRouter } from 'vue-router';

const props = defineProps({
  workflows: {
    type: Array,
    required: true
  },
  loading: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['duplicate', 'archive']);

const router = useRouter();

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

const getStatusColor = (status) => {
  const colors = {
    'Draft': 'bg-gray-100 text-gray-800',
    'Published': 'bg-green-100 text-green-800',
    'Archived': 'bg-red-100 text-red-800'
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
};

const handleOpen = (workflowId) => {
  router.push(`/workflows/${workflowId}`);
};
</script>

<template>
  <div class="bg-white shadow-md rounded-lg overflow-hidden">
    <div v-if="loading" class="p-8 text-center text-gray-500">
      Loading workflows...
    </div>

    <div v-else-if="workflows.length === 0" class="p-8 text-center text-gray-500">
      No workflows found. Create your first workflow to get started.
    </div>

    <table v-else class="min-w-full divide-y divide-gray-200">
      <thead class="bg-gray-50">
        <tr>
          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Title
          </th>
          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Status
          </th>
          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Version
          </th>
          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Updated
          </th>
          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Owner
          </th>
          <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
            Actions
          </th>
        </tr>
      </thead>
      <tbody class="bg-white divide-y divide-gray-200">
        <tr v-for="workflow in workflows" :key="workflow.id" class="hover:bg-gray-50">
          <td class="px-6 py-4 whitespace-nowrap">
            <div class="text-sm font-medium text-gray-900">
              {{ workflow.title }}
            </div>
            <div v-if="workflow.description" class="text-sm text-gray-500 truncate max-w-md">
              {{ workflow.description }}
            </div>
          </td>
          <td class="px-6 py-4 whitespace-nowrap">
            <span class="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full" :class="getStatusColor(workflow.status)">
              {{ workflow.status }}
            </span>
          </td>
          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
            v{{ workflow.current_version_id || 1 }}
          </td>
          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
            {{ formatDate(workflow.updated_at) }}
          </td>
          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
            {{ workflow.owner }}
          </td>
          <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
            <button
              @click="handleOpen(workflow.id)"
              class="text-blue-600 hover:text-blue-900 mr-3"
            >
              Open
            </button>
            <button
              @click="emit('duplicate', workflow.id)"
              class="text-green-600 hover:text-green-900 mr-3"
            >
              Duplicate
            </button>
            <button
              v-if="workflow.status !== 'Archived'"
              @click="emit('archive', workflow.id)"
              class="text-red-600 hover:text-red-900"
            >
              Archive
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
