import { defineStore } from 'pinia';
import axios from 'axios';

export const useConnectionStore = defineStore('connection', {
  state: () => ({
    connections: [],
    selectedConnection: null,
    loading: false,
    error: null,
    // Connection creation state
    isCreating: false,
    tempConnection: null
  }),

  getters: {
    getConnectionsByNode: (state) => (nodeId) => {
      return {
        outgoing: state.connections.filter(c => c.from_node_id === nodeId),
        incoming: state.connections.filter(c => c.to_node_id === nodeId)
      };
    }
  },

  actions: {
    async fetchConnections(workflowId, versionId) {
      this.loading = true;
      this.error = null;

      try {
        const response = await axios.get(`/api/workflows/${workflowId}/versions/${versionId}/connections`);
        this.connections = response.data.data.connections;
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to fetch connections';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async createConnection(workflowId, versionId, connectionData) {
      try {
        const response = await axios.post(
          `/api/workflows/${workflowId}/versions/${versionId}/connections`,
          connectionData
        );
        this.connections.push(response.data.data.connection);
        return response.data.data.connection;
      } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to create connection');
      }
    },

    async updateConnection(workflowId, versionId, connectionId, updates) {
      try {
        const response = await axios.patch(
          `/api/workflows/${workflowId}/versions/${versionId}/connections/${connectionId}`,
          updates
        );
        const index = this.connections.findIndex(c => c._id === connectionId);
        if (index !== -1) {
          this.connections[index] = response.data.data.connection;
        }
        if (this.selectedConnection?._id === connectionId) {
          this.selectedConnection = response.data.data.connection;
        }
        return response.data.data.connection;
      } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to update connection');
      }
    },

    async deleteConnection(workflowId, versionId, connectionId) {
      try {
        await axios.delete(`/api/workflows/${workflowId}/versions/${versionId}/connections/${connectionId}`);
        this.connections = this.connections.filter(c => c._id !== connectionId);
        if (this.selectedConnection?._id === connectionId) {
          this.selectedConnection = null;
        }
      } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to delete connection');
      }
    },

    selectConnection(connection) {
      this.selectedConnection = connection;
    },

    clearSelection() {
      this.selectedConnection = null;
    },

    startConnectionCreation(fromNodeId, startPosition) {
      this.isCreating = true;
      this.tempConnection = {
        from_node_id: fromNodeId,
        startPosition,
        currentPosition: startPosition
      };
    },

    updateTempConnection(position) {
      if (this.tempConnection) {
        this.tempConnection.currentPosition = position;
      }
    },

    cancelConnectionCreation() {
      this.isCreating = false;
      this.tempConnection = null;
    }
  }
});
