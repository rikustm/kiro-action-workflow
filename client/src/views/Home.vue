<script setup>
import { onMounted } from 'vue';
import { useAppStore } from '../stores/app';

const appStore = useAppStore();

onMounted(() => {
  appStore.fetchHealth();
});
</script>

<template>
  <div class="min-h-screen flex items-center justify-center p-4">
    <div class="max-w-2xl w-full bg-white rounded-lg shadow-lg p-8">
      <h1 class="text-4xl font-bold text-gray-800 mb-4">
        Kiro Action Workflow
      </h1>
      <p class="text-lg text-gray-600 mb-6">
        Vue 3 + Express full-stack application
      </p>
      
      <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p class="text-sm font-medium text-blue-800">Server Status</p>
        <p class="text-blue-600 mt-1">
          {{ appStore.loading ? 'Checking...' : appStore.serverMessage }}
        </p>
      </div>
    </div>
  </div>
</template>
