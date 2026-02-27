<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';

const router = useRouter();
const authStore = useAuthStore();

const email = ref('');
const password = ref('');

const handleLogin = async () => {
  const success = await authStore.login(email.value, password.value);
  if (success) {
    router.push('/');
  }
};
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 px-4">
    <div class="max-w-md w-full bg-white rounded-lg shadow-md p-8">
      <h1 class="text-3xl font-bold text-gray-800 mb-6 text-center">
        Login
      </h1>

      <form @submit.prevent="handleLogin" class="space-y-4">
        <div>
          <label for="email" class="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            id="email"
            v-model="email"
            type="email"
            required
            class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            placeholder="you@example.com"
          />
        </div>

        <div>
          <label for="password" class="block text-sm font-medium text-gray-700 mb-1">
            Password
          </label>
          <input
            id="password"
            v-model="password"
            type="password"
            required
            class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            placeholder="••••••••"
          />
        </div>

        <div v-if="authStore.error" class="text-red-600 text-sm">
          {{ authStore.error }}
        </div>

        <button
          type="submit"
          :disabled="authStore.loading"
          class="w-full py-2 px-4 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {{ authStore.loading ? 'Logging in...' : 'Login' }}
        </button>
      </form>

      <p class="mt-4 text-center text-sm text-gray-600">
        Don't have an account?
        <router-link to="/register" class="text-blue-600 hover:text-blue-700 font-medium">
          Register
        </router-link>
      </p>
    </div>
  </div>
</template>
