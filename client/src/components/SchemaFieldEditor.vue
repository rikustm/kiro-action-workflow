<script setup>
import { ref, computed } from 'vue';

const props = defineProps({
  modelValue: {
    type: Array,
    default: () => []
  }
});

const emit = defineEmits(['update:modelValue']);

const fields = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
});

const fieldTypes = [
  { value: 'text', label: 'Text' },
  { value: 'number', label: 'Number' },
  { value: 'boolean', label: 'Boolean' },
  { value: 'select', label: 'Select' },
  { value: 'multi-select', label: 'Multi-Select' },
  { value: 'date', label: 'Date' }
];

const addField = () => {
  const newFields = [...fields.value, {
    name: '',
    label: '',
    type: 'text',
    required: false,
    options: []
  }];
  fields.value = newFields;
};

const removeField = (index) => {
  const newFields = fields.value.filter((_, i) => i !== index);
  fields.value = newFields;
};

const updateField = (index, key, value) => {
  const newFields = [...fields.value];
  newFields[index] = { ...newFields[index], [key]: value };
  fields.value = newFields;
};

const addOption = (fieldIndex) => {
  const newFields = [...fields.value];
  if (!newFields[fieldIndex].options) {
    newFields[fieldIndex].options = [];
  }
  newFields[fieldIndex].options.push('');
  fields.value = newFields;
};

const removeOption = (fieldIndex, optionIndex) => {
  const newFields = [...fields.value];
  newFields[fieldIndex].options = newFields[fieldIndex].options.filter((_, i) => i !== optionIndex);
  fields.value = newFields;
};

const updateOption = (fieldIndex, optionIndex, value) => {
  const newFields = [...fields.value];
  newFields[fieldIndex].options[optionIndex] = value;
  fields.value = newFields;
};

const needsOptions = (type) => {
  return type === 'select' || type === 'multi-select';
};
</script>

<template>
  <div class="space-y-4">
    <div class="flex justify-between items-center">
      <h3 class="text-sm font-medium text-gray-700">Field Schema</h3>
      <button
        @click="addField"
        type="button"
        class="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
      >
        Add Field
      </button>
    </div>

    <div v-if="fields.length === 0" class="text-sm text-gray-500 text-center py-8 border-2 border-dashed border-gray-300 rounded-md">
      No fields defined. Click "Add Field" to create one.
    </div>

    <div v-for="(field, index) in fields" :key="index" class="border border-gray-300 rounded-md p-4 space-y-3">
      <div class="flex justify-between items-start">
        <h4 class="text-sm font-medium text-gray-700">Field {{ index + 1 }}</h4>
        <button
          @click="removeField(index)"
          type="button"
          class="text-red-600 hover:text-red-800 text-sm"
        >
          Remove
        </button>
      </div>

      <div class="grid grid-cols-2 gap-3">
        <div>
          <label class="block text-xs font-medium text-gray-700 mb-1">
            Field Name
          </label>
          <input
            :value="field.name"
            @input="updateField(index, 'name', $event.target.value)"
            type="text"
            placeholder="e.g., priority"
            class="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label class="block text-xs font-medium text-gray-700 mb-1">
            Label
          </label>
          <input
            :value="field.label"
            @input="updateField(index, 'label', $event.target.value)"
            type="text"
            placeholder="e.g., Priority"
            class="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      <div class="grid grid-cols-2 gap-3">
        <div>
          <label class="block text-xs font-medium text-gray-700 mb-1">
            Type
          </label>
          <select
            :value="field.type"
            @change="updateField(index, 'type', $event.target.value)"
            class="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option v-for="type in fieldTypes" :key="type.value" :value="type.value">
              {{ type.label }}
            </option>
          </select>
        </div>

        <div class="flex items-end">
          <label class="flex items-center space-x-2 cursor-pointer">
            <input
              :checked="field.required"
              @change="updateField(index, 'required', $event.target.checked)"
              type="checkbox"
              class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span class="text-sm text-gray-700">Required</span>
          </label>
        </div>
      </div>

      <div v-if="needsOptions(field.type)" class="space-y-2">
        <div class="flex justify-between items-center">
          <label class="block text-xs font-medium text-gray-700">
            Options
          </label>
          <button
            @click="addOption(index)"
            type="button"
            class="px-2 py-1 text-xs bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
          >
            Add Option
          </button>
        </div>

        <div v-for="(option, optionIndex) in field.options" :key="optionIndex" class="flex gap-2">
          <input
            :value="option"
            @input="updateOption(index, optionIndex, $event.target.value)"
            type="text"
            placeholder="Option value"
            class="flex-1 px-3 py-1 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            @click="removeOption(index, optionIndex)"
            type="button"
            class="px-2 py-1 text-sm text-red-600 hover:text-red-800"
          >
            ×
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
