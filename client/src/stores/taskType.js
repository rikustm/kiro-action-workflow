import { defineStore } from 'pinia';
import axios from 'axios';

export const useTaskTypeStore = defineStore('taskType', {
  state: () => ({
    taskTypes: [],
    loading: false,
    error: null
  }),

  actions: {
    async fetchTaskTypes() {
      this.loading = true;
      this.error = null;

      try {
        const response = await axios.get('/api/task-types');
        this.taskTypes = response.data.data.taskTypes;
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to fetch task types';
        throw error;
      } finally {
        this.loading = false;
      }
    }
  }
});
