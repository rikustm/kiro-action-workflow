import { defineStore } from 'pinia';
import axios from 'axios';

export const useWorkflowStore = defineStore('workflow', {
  state: () => ({
    workflows: [],
    loading: false,
    error: null,
    filters: {
      status: '',
      owner: ''
    },
    pagination: {
      page: 1,
      limit: 20,
      total: 0,
      pages: 0
    }
  }),

  actions: {
    async fetchWorkflows() {
      this.loading = true;
      this.error = null;

      try {
        const params = {
          page: this.pagination.page,
          limit: this.pagination.limit
        };

        if (this.filters.status) {
          params.status = this.filters.status;
        }

        if (this.filters.owner) {
          params.owner = this.filters.owner;
        }

        const response = await axios.get('/api/workflows', { params });
        
        this.workflows = response.data.data.workflows;
        this.pagination = response.data.data.pagination;
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to fetch workflows';
      } finally {
        this.loading = false;
      }
    },

    async createWorkflow(title, description = '') {
      try {
        const response = await axios.post('/api/workflows', {
          title,
          description
        });

        await this.fetchWorkflows();
        return response.data.data.workflow;
      } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to create workflow');
      }
    },

    async duplicateWorkflow(workflowId) {
      try {
        await axios.post(`/api/workflows/${workflowId}/duplicate`);
        await this.fetchWorkflows();
      } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to duplicate workflow');
      }
    },

    async archiveWorkflow(workflowId) {
      try {
        await axios.delete(`/api/workflows/${workflowId}`);
        await this.fetchWorkflows();
      } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to archive workflow');
      }
    },

    setFilter(key, value) {
      this.filters[key] = value;
      this.pagination.page = 1;
      this.fetchWorkflows();
    },

    setPage(page) {
      this.pagination.page = page;
      this.fetchWorkflows();
    }
  }
});
