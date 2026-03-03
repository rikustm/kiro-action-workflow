import { defineStore } from 'pinia';
import axios from 'axios';

export const useTaskTypeStore = defineStore('taskType', {
  state: () => ({
    taskTypes: [],
    loading: false,
    error: null
  }),

  actions: {
    async fetchTaskTypes(activeOnly = false) {
      this.loading = true;
      this.error = null;

      try {
        const params = activeOnly ? { active_only: 'true' } : {};
        const response = await axios.get('/api/task-types', { params });
        this.taskTypes = response.data.data.taskTypes;
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to fetch task types';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async createTaskType(taskTypeData) {
      this.loading = true;
      this.error = null;

      try {
        const response = await axios.post('/api/task-types', taskTypeData);
        this.taskTypes.push(response.data.data.taskType);
        return response.data.data.taskType;
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to create task type';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async updateTaskType(id, taskTypeData) {
      this.loading = true;
      this.error = null;

      try {
        const response = await axios.patch(`/api/task-types/${id}`, taskTypeData);
        const index = this.taskTypes.findIndex(t => t._id === id);
        if (index !== -1) {
          this.taskTypes[index] = response.data.data.taskType;
        }
        return response.data.data.taskType;
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to update task type';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async deactivateTaskType(id) {
      this.loading = true;
      this.error = null;

      try {
        await axios.delete(`/api/task-types/${id}`);
        const index = this.taskTypes.findIndex(t => t._id === id);
        if (index !== -1) {
          this.taskTypes[index].is_active = false;
        }
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to deactivate task type';
        throw error;
      } finally {
        this.loading = false;
      }
    }
  }
});
