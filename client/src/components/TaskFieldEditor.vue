<template>
  <div class="space-y-4 pt-4 border-t border-gray-200">
    <h4 class="text-sm font-medium text-gray-700">Custom Fields</h4>
    
    <div v-for="field in fields" :key="field.name" class="space-y-1">
      <label class="block text-sm font-medium text-gray-700">
        {{ field.label }}
        <span v-if="field.required" class="text-red-500">*</span>
      </label>

      <!-- Text Input -->
      <input
        v-if="field.type === 'text'"
        v-model="localValues[field.name]"
        @blur="emitUpdate"
        type="text"
        :placeholder="field.placeholder"
        class="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      <!-- Number Input -->
      <input
        v-else-if="field.type === 'number'"
        v-model.number="localValues[field.name]"
        @blur="emitUpdate"
        type="number"
        :placeholder="field.placeholder"
        class="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      <!-- Boolean Checkbox -->
      <div v-else-if="field.type === 'boolean'" class="flex items-center">
        <input
          v-model="localValues[field.name]"
          @change="emitUpdate"
          type="checkbox"
          class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
        />
        <span class="ml-2 text-sm text-gray-600">{{ field.placeholder || 'Enable' }}</span>
      </div>

      <!-- Select Dropdown -->
      <select
        v-else-if="field.type === 'select'"
        v-model="localValues[field.name]"
        @change="emitUpdate"
        class="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="">{{ field.placeholder || 'Select an option' }}</option>
        <option v-for="option in field.options" :key="option" :value="option">
          {{ option }}
        </option>
      </select>

      <!-- Multi-Select -->
      <div v-else-if="field.type === 'multi-select'" class="space-y-2">
        <div v-for="option in field.options" :key="option" class="flex items-center">
          <input
            :id="`${field.name}-${option}`"
            v-model="localValues[field.name]"
            @change="emitUpdate"
            type="checkbox"
            :value="option"
            class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <label :for="`${field.name}-${option}`" class="ml-2 text-sm text-gray-700">
            {{ option }}
          </label>
        </div>
      </div>

      <!-- Date Input -->
      <input
        v-else-if="field.type === 'date'"
        v-model="localValues[field.name]"
        @blur="emitUpdate"
        type="date"
        class="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      <!-- Help Text -->
      <p v-if="field.help_text" class="text-xs text-gray-500">
        {{ field.help_text }}
      </p>
    </div>

    <div v-if="fields.length === 0" class="text-sm text-gray-500 italic">
      No custom fields defined for this task type
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';

const props = defineProps({
  fields: {
    type: Array,
    default: () => []
  },
  values: {
    type: Object,
    default: () => ({})
  }
});

const emit = defineEmits(['update']);

const localValues = ref({});

const initializeValues = () => {
  const initialized = {};
  props.fields.forEach(field => {
    if (props.values[field.name] !== undefined) {
      initialized[field.name] = props.values[field.name];
    } else if (field.type === 'boolean') {
      initialized[field.name] = false;
    } else if (field.type === 'multi-select') {
      initialized[field.name] = [];
    } else {
      initialized[field.name] = '';
    }
  });
  localValues.value = initialized;
};

const emitUpdate = () => {
  emit('update', { ...localValues.value });
};

watch(() => [props.fields, props.values], () => {
  initializeValues();
}, { immediate: true, deep: true });
</script>
