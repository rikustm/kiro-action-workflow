<script setup>
import { ref, watch } from 'vue';
import SchemaFieldEditor from './SchemaFieldEditor.vue';

const props = defineProps({
  taskType: {
    type: Object,
    default: null
  },
  loading: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['submit', 'cancel']);

const formData = ref({
  name: '',
  description: '',
  field_schema: [],
  icon: ''
});

const error = ref('');

// Common icon options
const iconOptions = [
  '📋', '✅', '📝', '🔧', '⚙️', '📊', '📈', '💼', 
  '🎯', '🚀', '⭐', '🔔', '📌', '🏷️', '📦', '🔍'
];

// Initialize form with existing task type data
watch(() => props.taskType, (newValue) => {
  if (newValue) {
    formData.value = {
      name: newValue.name || '',
      description: newValue.description || '',
      field_schema: newValue.field_schema || [],
      icon: newValue.icon || ''
    };
  } else {
    formData.value = {
      name: '',
      description: '',
      field_schema: [],
      icon: ''
    };
  }
}, { immediate: true });

const handleSubmit = () => {
  error.value = '';

  // Validation
  if (!formData.value.name.trim()) {
    error.value = 'Name is required';
    return;
  }

  if (!formData.value.field_schema || formData.value.field_schema.length === 0) {
    error.value = 'At least one field is required';
    return;
  }

  // Validate each field
  for (let i = 0; i < formData.value.field_schema.length; i++) {
    const field = formData.value.field_schema[i];
    if (!field.name || !field.label) {
      error.value = `Field ${i + 1}: Name and label are required`;
      return;
    }
    if ((field.type === 'select' || field.type === 'multi-select') && (!field.options || field.options.length === 0)) {
      error.value = `Field ${i + 1}: Options are required for select fields`;
      return;
    }
  }

  emit('submit', formData.value);
};

const handleCancel = () => {
  emit('cancel');
};
</script>

<template>
  <div class="space-y-6">
    <div>
      <label for="name" class="block text-sm font-medium text-gray-700 mb-1">
        Name <span class="text-red-500">*</span>
      </label>
      <input
        id="name"
        v-model="formData.name"
        type="text"
        placeholder="e.g., Code Review"
        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
    </div>

    <div>
      <label for="description" class="block text-sm font-medium text-gray-700 mb-1">
        Description
      </label>
      <textarea
        id="description"
        v-model="formData.description"
        rows="3"
        placeholder="Describe this task type..."
        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
    </div>

    <div>
      <label class="block text-sm font-medium text-gray-700 mb-2">
        Icon
      </label>
      <div class="flex flex-wrap gap-2">
        <button
          v-for="icon in iconOptions"
          :key="icon"
          @click="formData.icon = icon"
          type="button"
          class="w-10 h-10 flex items-center justify-center text-xl border rounded-md hover:bg-gray-100"
          :class="formData.icon === icon ? 'border-blue-500 bg-blue-50' : 'border-gray-300'"
        >
          {{ icon }}
        </button>
        <input
          v-model="formData.icon"
          type="text"
          placeholder="Or type emoji"
          class="w-24 px-2 py-1 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
    </div>

    <SchemaFieldEditor v-model="formData.field_schema" />

    <div v-if="error" class="text-red-600 text-sm">
      {{ error }}
    </div>

    <div class="flex justify-end gap-3 pt-4 border-t">
      <button
        @click="handleCancel"
        type="button"
        :disabled="loading"
        class="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md disabled:opacity-50"
      >
        Cancel
      </button>
      <button
        @click="handleSubmit"
        type="button"
        :disabled="loading"
        class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
      >
        {{ loading ? 'Saving...' : (taskType ? 'Update' : 'Create') }}
      </button>
    </div>
  </div>
</template>
