import { defineStore } from 'pinia';
import axios from 'axios';

export const useAppStore = defineStore('app', {
  state: () => ({
    serverMessage: '',
    loading: false,
    error: null
  }),
  
  actions: {
    async fetchHealth() {
      this.loading = true;
      this.error = null;
      
      try {
        const response = await axios.get('/api/health');
        this.serverMessage = response.data.message;
      } catch (error) {
        this.error = error.message;
        this.serverMessage = 'Failed to connect to server';
      } finally {
        this.loading = false;
      }
    }
  }
});
