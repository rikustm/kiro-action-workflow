import { defineStore } from 'pinia';
import axios from 'axios';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    token: localStorage.getItem('token') || null,
    loading: false,
    error: null
  }),

  getters: {
    isAuthenticated: (state) => !!state.token,
    isAdmin: (state) => state.user?.role === 'admin'
  },

  actions: {
    async register(email, password) {
      this.loading = true;
      this.error = null;

      try {
        const response = await axios.post('/api/auth/register', {
          email,
          password
        });

        this.token = response.data.data.token;
        this.user = response.data.data.user;
        localStorage.setItem('token', this.token);
        
        this.setupAxiosInterceptor();
        return true;
      } catch (error) {
        this.error = error.response?.data?.message || 'Registration failed';
        return false;
      } finally {
        this.loading = false;
      }
    },

    async login(email, password) {
      this.loading = true;
      this.error = null;

      try {
        const response = await axios.post('/api/auth/login', {
          email,
          password
        });

        this.token = response.data.data.token;
        this.user = response.data.data.user;
        localStorage.setItem('token', this.token);
        
        this.setupAxiosInterceptor();
        return true;
      } catch (error) {
        this.error = error.response?.data?.message || 'Login failed';
        return false;
      } finally {
        this.loading = false;
      }
    },

    logout() {
      this.user = null;
      this.token = null;
      localStorage.removeItem('token');
    },

    setupAxiosInterceptor() {
      axios.interceptors.request.use(
        (config) => {
          if (this.token) {
            config.headers.Authorization = `Bearer ${this.token}`;
          }
          return config;
        },
        (error) => Promise.reject(error)
      );

      axios.interceptors.response.use(
        (response) => response,
        (error) => {
          if (error.response?.status === 401) {
            this.logout();
            window.location.href = '/login';
          }
          return Promise.reject(error);
        }
      );
    },

    initAuth() {
      if (this.token) {
        this.setupAxiosInterceptor();
      }
    }
  }
});
