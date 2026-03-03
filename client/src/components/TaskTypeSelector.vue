<template>
  <div class="space-y-4">
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-2">
        Select Task Type
      </label>
      <div class="space-y-2 max-h-96 overflow-y-auto">
        <button
          v-for="taskType in taskTypes"
          :key="taskType._id"
          @click="selectTaskType(taskType)"
          class="w-full text-left p-3 border rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-colors"
          :class="selectedTaskTypeId === taskType._id ? 'bg-blue-50 border-blue-300' : 'border-gray-200'"
        >
          <div class="font-medium text-gray-900">{{ taskType.name }}</div>
          <div v-if="taskType.description" class="text-sm text-gray-500 mt-1">
            {{ taskType.description }}
          </div>
        </button>
      </div>
    </div>

    <div v-if="selectedTaskType" class="pt-4 border-t border-gray-200">
      <h4 class="text-sm font-medium text-gray-700 mb-3">Task Details</h4>
      
      <div class="space-y-3">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Task Name
          </label>
          <input
            v-model="taskName"
            type="text"
            placeholder="Enter task name"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Description (optional)
          </label>
          <textarea
            v-model="taskDescription"
            placeholder="Enter task description"
            rows="3"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
    </div>

    <div class="flex justify-end gap-2 pt-4 border-t border-gray-200">
      <button
        @click="$emit('cancel')"
        class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
      >
        Cancel
      </button>
      <button
        @click="handleCreate"
        :disabled="!canCreate"
        class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
      >
        Create Task
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

const props = defineProps({
  taskTypes: {
    type: Array,
    required: true
  }
});

const emit = defineEmits(['create', 'cancel']);

const selectedTaskTypeId = ref(null);
const taskName = ref('');
const taskDescription = ref('');

const selectedTaskType = computed(() => {
  return props.taskTypes.find(t => t._id === selectedTaskTypeId.value);
});

const canCreate = computed(() => {
  return selectedTaskTypeId.value && taskName.value.trim().length > 0;
});

const selectTaskType = (taskType) => {
  selectedTaskTypeId.value = taskType._id;
  if (!taskName.value) {
    taskName.value = taskType.name;
  }
};

const handleCreate = () => {
  if (!canCreate.value) return;

  emit('create', {
    node_type: 'TASK',
    task_type_id: selectedTaskTypeId.value,
    name: taskName.value.trim(),
    description: taskDescription.value.trim(),
    task_data: {}
  });
};
</script>
