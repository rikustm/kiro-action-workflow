<template>
  <div class="inline-edit-wrapper">
    <!-- Display Mode -->
    <div
      v-if="!isEditing"
      @click="startEdit"
      class="inline-edit-display cursor-pointer hover:bg-gray-50 rounded px-2 py-1 transition-colors"
      :class="displayClass"
    >
      <span v-if="modelValue" :class="textClass">{{ modelValue }}</span>
      <span v-else class="text-gray-400 italic">{{ placeholder }}</span>
    </div>

    <!-- Edit Mode -->
    <div v-else class="inline-edit-input relative">
      <input
        v-if="type === 'text'"
        ref="inputRef"
        v-model="editValue"
        @blur="handleBlur"
        @keydown.enter="save"
        @keydown.esc="cancel"
        :placeholder="placeholder"
        class="w-full px-2 py-1 border border-blue-500 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        :class="inputClass"
      />
      <textarea
        v-else
        ref="inputRef"
        v-model="editValue"
        @blur="handleBlur"
        @keydown.esc="cancel"
        :placeholder="placeholder"
        :rows="rows"
        class="w-full px-2 py-1 border border-blue-500 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        :class="inputClass"
      />
      
      <!-- Status Indicators -->
      <div v-if="saving" class="absolute right-2 top-1/2 transform -translate-y-1/2">
        <svg class="animate-spin h-4 w-4 text-blue-500" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>
      <div v-if="showSuccess" class="absolute right-2 top-1/2 transform -translate-y-1/2">
        <svg class="h-4 w-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
        </svg>
      </div>
    </div>

    <!-- Error Message -->
    <div v-if="error" class="text-red-500 text-sm mt-1">
      {{ error }}
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick, watch } from 'vue';

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  placeholder: {
    type: String,
    default: 'Click to edit'
  },
  type: {
    type: String,
    default: 'text',
    validator: (value) => ['text', 'textarea'].includes(value)
  },
  rows: {
    type: Number,
    default: 3
  },
  displayClass: {
    type: String,
    default: ''
  },
  textClass: {
    type: String,
    default: ''
  },
  inputClass: {
    type: String,
    default: ''
  },
  debounce: {
    type: Number,
    default: 500
  },
  onSave: {
    type: Function,
    required: true
  }
});

const emit = defineEmits(['update:modelValue']);

const isEditing = ref(false);
const editValue = ref('');
const saving = ref(false);
const showSuccess = ref(false);
const error = ref(null);
const inputRef = ref(null);
let debounceTimer = null;

const startEdit = () => {
  editValue.value = props.modelValue;
  isEditing.value = true;
  error.value = null;
  
  nextTick(() => {
    if (inputRef.value) {
      inputRef.value.focus();
      if (props.type === 'text') {
        inputRef.value.select();
      }
    }
  });
};

const cancel = () => {
  editValue.value = props.modelValue;
  isEditing.value = false;
  error.value = null;
  if (debounceTimer) {
    clearTimeout(debounceTimer);
  }
};

const save = async () => {
  if (editValue.value === props.modelValue) {
    isEditing.value = false;
    return;
  }

  if (debounceTimer) {
    clearTimeout(debounceTimer);
  }

  saving.value = true;
  error.value = null;

  try {
    await props.onSave(editValue.value);
    emit('update:modelValue', editValue.value);
    saving.value = false;
    showSuccess.value = true;
    
    setTimeout(() => {
      showSuccess.value = false;
      isEditing.value = false;
    }, 1000);
  } catch (err) {
    saving.value = false;
    error.value = err.message || 'Failed to save';
  }
};

const handleBlur = () => {
  if (debounceTimer) {
    clearTimeout(debounceTimer);
  }
  
  debounceTimer = setTimeout(() => {
    if (!saving.value && isEditing.value) {
      save();
    }
  }, props.debounce);
};

watch(() => props.modelValue, (newValue) => {
  if (!isEditing.value) {
    editValue.value = newValue;
  }
});
</script>
