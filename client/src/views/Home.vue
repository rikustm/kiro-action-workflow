<script setup>
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAppStore } from '../stores/app';
import { useAuthStore } from '../stores/auth';

const router = useRouter();
const appStore = useAppStore();
const authStore = useAuthStore();

onMounted(() => {
  appStore.fetchHealth();
});

const handleLogout = () => {
  authStore.logout();
  router.push('/login');
};
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <nav class="bg-white shadow-sm">
      <div class="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        <h1 class="text-xl font-bold text-gray-800">Kiro Action Workflow</h1>
        <button
          @click="handleLogout"
          class="px-4 py-2 text-sm text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md"
        >
          Logout
        </button>
      </div>
    </nav>

    <div class="flex items-center justify-center p-8">
      <div class="max-w-2xl w-full bg-white rounded-lg shadow-lg p-8">
        <h2 class="text-3xl font-bold text-gray-800 mb-4">
          Welcome!
        </h2>
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
  </div>
</template>
