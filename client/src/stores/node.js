import { defineStore } from 'pinia';
import axios from 'axios';

export const useNodeStore = defineStore('node', {
  state: () => ({
    nodes: [],
    selectedNode: null,
    loading: false,
    error: null
  }),

  actions: {
    async fetchNodes(workflowId, versionId) {
      this.loading = true;
      this.error = null;

      try {
        const response = await axios.get(`/api/workflows/${workflowId}/versions/${versionId}/nodes`);
        this.nodes = response.data.data.nodes;
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to fetch nodes';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async createNode(workflowId, versionId, nodeData) {
      try {
        const response = await axios.post(
          `/api/workflows/${workflowId}/versions/${versionId}/nodes`,
          nodeData
        );
        this.nodes.push(response.data.data.node);
        return response.data.data.node;
      } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to create node');
      }
    },

    async updateNode(workflowId, versionId, nodeId, updates) {
      try {
        const response = await axios.patch(
          `/api/workflows/${workflowId}/versions/${versionId}/nodes/${nodeId}`,
          updates
        );
        const index = this.nodes.findIndex(n => n._id === nodeId);
        if (index !== -1) {
          this.nodes[index] = response.data.data.node;
        }
        if (this.selectedNode?._id === nodeId) {
          this.selectedNode = response.data.data.node;
        }
        return response.data.data.node;
      } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to update node');
      }
    },

    async deleteNode(workflowId, versionId, nodeId) {
      try {
        await axios.delete(`/api/workflows/${workflowId}/versions/${versionId}/nodes/${nodeId}`);
        this.nodes = this.nodes.filter(n => n._id !== nodeId);
        if (this.selectedNode?._id === nodeId) {
          this.selectedNode = null;
        }
      } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to delete node');
      }
    },

    selectNode(node) {
      this.selectedNode = node;
    },

    clearSelection() {
      this.selectedNode = null;
    }
  }
});
