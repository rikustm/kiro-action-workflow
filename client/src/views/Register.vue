<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';

const router = useRouter();
const authStore = useAuthStore();

const email = ref('');
const password = ref('');
const confirmPassword = ref('');
const errors = ref({});

const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const handleRegister = async () => {
  errors.value = {};

  if (!email.value) {
    errors.value.email = 'Email is required';
  } else if (!validateEmail(email.value)) {
    errors.value.email = 'Please enter a valid email address';
  }

  if (!password.value) {
    errors.value.password = 'Password is required';
  } else if (password.value.length < 6) {
    errors.value.password = 'Password must be at least 6 characters';
  }

  if (!confirmPassword.value) {
    errors.value.confirmPassword = 'Please confirm your password';
  } else if (password.value !== confirmPassword.value) {
    errors.value.confirmPassword = 'Passwords do not match';
  }

  if (Object.keys(errors.value).length > 0) {
    return;
  }

  const success = await authStore.register(email.value, password.value);
  if (success) {
    router.push('/');
  }
};
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 px-4">
    <div class="max-w-md w-full bg-white rounded-lg shadow-md p-8">
      <h1 class="text-3xl font-bold text-gray-800 mb-6 text-center">
        Register
      </h1>

      <form @submit.prevent="handleRegister" class="space-y-4">
        <div>
          <label for="email" class="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            id="email"
            v-model="email"
            type="email"
            class="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            :class="{ 'border-red-500': errors.email, 'border-gray-300': !errors.email }"
            placeholder="you@example.com"
          />
          <p v-if="errors.email" class="mt-1 text-sm text-red-600">
            {{ errors.email }}
          </p>
        </div>

        <div>
          <label for="password" class="block text-sm font-medium text-gray-700 mb-1">
            Password
          </label>
          <input
            id="password"
            v-model="password"
            type="password"
            class="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            :class="{ 'border-red-500': errors.password, 'border-gray-300': !errors.password }"
            placeholder="••••••••"
          />
          <p v-if="errors.password" class="mt-1 text-sm text-red-600">
            {{ errors.password }}
          </p>
          <p v-else class="mt-1 text-xs text-gray-500">
            Must be at least 6 characters
          </p>
        </div>

        <div>
          <label for="confirmPassword" class="block text-sm font-medium text-gray-700 mb-1">
            Confirm Password
          </label>
          <input
            id="confirmPassword"
            v-model="confirmPassword"
            type="password"
            class="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            :class="{ 'border-red-500': errors.confirmPassword, 'border-gray-300': !errors.confirmPassword }"
            placeholder="••••••••"
          />
          <p v-if="errors.confirmPassword" class="mt-1 text-sm text-red-600">
            {{ errors.confirmPassword }}
          </p>
        </div>

        <div v-if="authStore.error" class="text-red-600 text-sm">
          {{ authStore.error }}
        </div>

        <button
          type="submit"
          :disabled="authStore.loading"
          class="w-full py-2 px-4 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {{ authStore.loading ? 'Creating account...' : 'Register' }}
        </button>
      </form>

      <p class="mt-4 text-center text-sm text-gray-600">
        Already have an account?
        <router-link to="/login" class="text-blue-600 hover:text-blue-700 font-medium">
          Login
        </router-link>
      </p>
    </div>
  </div>
</template>
