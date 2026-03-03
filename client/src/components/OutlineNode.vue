<template>
  <div class="outline-node">
    <!-- Node Item -->
    <div
      @click="handleClick"
      class="flex items-start gap-2 px-2 py-1.5 rounded cursor-pointer hover:bg-gray-50 transition-colors"
      :class="{
        'bg-blue-50 border border-blue-200': isSelected,
        'hover:bg-gray-100': !isSelected
      }"
      :style="{ paddingLeft: `${depth * 16 + 8}px` }"
    >
      <!-- Expand/Collapse Icon -->
      <button
        v-if="node.children && node.children.length > 0"
        @click.stop="toggleExpanded"
        class="flex-shrink-0 w-4 h-4 flex items-center justify-center text-gray-400 hover:text-gray-600"
      >
        <svg
          class="w-3 h-3 transition-transform"
          :class="{ 'rotate-90': isExpanded }"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>
      </button>
      <div v-else class="w-4 flex-shrink-0"></div>

      <!-- Node Type Icon -->
      <div class="flex-shrink-0 mt-0.5">
        <div
          v-if="node.type === 'TASK'"
          class="w-5 h-5 rounded bg-blue-100 flex items-center justify-center"
        >
          <svg class="w-3 h-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </div>
        <div
          v-else
          class="w-5 h-5 rounded-full bg-amber-100 flex items-center justify-center"
        >
          <svg class="w-3 h-3 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
      </div>

      <!-- Node Info -->
      <div class="flex-1 min-w-0">
        <div class="flex items-center gap-2">
          <span class="text-sm font-medium text-gray-900 truncate">
            {{ node.name }}
          </span>
          <span class="text-xs text-gray-500 flex-shrink-0">
            {{ node.type === 'TASK' ? 'Task' : 'Decision' }}
          </span>
        </div>
        <div v-if="node.description" class="text-xs text-gray-500 truncate mt-0.5">
          {{ node.description }}
        </div>
      </div>
    </div>

    <!-- Children (with branch labels) -->
    <div v-if="isExpanded && node.children && node.children.length > 0" class="mt-1">
      <div
        v-for="(child, index) in node.children"
        :key="child.id"
        class="relative"
      >
        <!-- Branch Label -->
        <div
          v-if="child.branchLabel"
          class="text-xs text-gray-400 italic ml-2"
          :style="{ paddingLeft: `${(depth + 1) * 16 + 8}px` }"
        >
          → {{ child.branchLabel }}
        </div>
        
        <!-- Child Node -->
        <OutlineNode
          :node="child"
          :depth="depth + 1"
          :selected-node-id="selectedNodeId"
          @select="$emit('select', $event)"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

const props = defineProps({
  node: {
    type: Object,
    required: true
  },
  depth: {
    type: Number,
    default: 0
  },
  selectedNodeId: {
    type: String,
    default: null
  }
});

const emit = defineEmits(['select']);

const isExpanded = ref(true);
const isSelected = computed(() => props.selectedNodeId === props.node.id);

const toggleExpanded = () => {
  isExpanded.value = !isExpanded.value;
};

const handleClick = () => {
  emit('select', props.node.id);
};
</script>
