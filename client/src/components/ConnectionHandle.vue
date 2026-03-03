<template>
  <div
    class="connection-handle absolute cursor-pointer transition-all"
    :class="handleClass"
    :style="handleStyle"
    @mousedown="startConnection"
    @touchstart="startConnection"
  >
    <div
      class="w-3 h-3 rounded-full border-2 transition-all"
      :class="dotClass"
    />
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  nodeId: {
    type: String,
    required: true
  },
  position: {
    type: String,
    default: 'right',
    validator: (value) => ['top', 'right', 'bottom', 'left'].includes(value)
  },
  type: {
    type: String,
    default: 'output',
    validator: (value) => ['input', 'output'].includes(value)
  },
  isActive: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['start-connection']);

const handleClass = computed(() => {
  const positions = {
    top: 'top-0 left-1/2 -translate-x-1/2 -translate-y-1/2',
    right: 'right-0 top-1/2 translate-x-1/2 -translate-y-1/2',
    bottom: 'bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2',
    left: 'left-0 top-1/2 -translate-x-1/2 -translate-y-1/2'
  };
  
  return [
    positions[props.position],
    props.isActive ? 'z-20' : 'z-10'
  ];
});

const handleStyle = computed(() => ({
  pointerEvents: props.type === 'output' ? 'auto' : 'none'
}));

const dotClass = computed(() => {
  if (props.isActive) {
    return 'bg-blue-500 border-blue-600 scale-125';
  }
  return props.type === 'output'
    ? 'bg-white border-gray-400 hover:bg-blue-100 hover:border-blue-500 hover:scale-110'
    : 'bg-white border-gray-300';
});

const startConnection = (event) => {
  if (props.type !== 'output') return;
  
  event.preventDefault();
  event.stopPropagation();
  
  const target = event.currentTarget;
  const rect = target.getBoundingClientRect();
  
  const position = {
    x: rect.left + rect.width / 2,
    y: rect.top + rect.height / 2
  };
  
  emit('start-connection', {
    nodeId: props.nodeId,
    position,
    event
  });
};
</script>
