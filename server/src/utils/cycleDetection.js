import Connection from '../models/Connection.js';

export const detectCycle = async (versionId, fromNodeId, toNodeId) => {
  const connections = await Connection.find({ 
    workflow_version_id: versionId 
  });

  const graph = new Map();
  
  connections.forEach(conn => {
    if (!graph.has(conn.from_node_id.toString())) {
      graph.set(conn.from_node_id.toString(), []);
    }
    graph.get(conn.from_node_id.toString()).push(conn.to_node_id.toString());
  });

  if (!graph.has(fromNodeId.toString())) {
    graph.set(fromNodeId.toString(), []);
  }
  graph.get(fromNodeId.toString()).push(toNodeId.toString());

  const visited = new Set();
  const recStack = new Set();

  const hasCycle = (node) => {
    if (recStack.has(node)) {
      return true;
    }
    
    if (visited.has(node)) {
      return false;
    }

    visited.add(node);
    recStack.add(node);

    const neighbors = graph.get(node) || [];
    for (const neighbor of neighbors) {
      if (hasCycle(neighbor)) {
        return true;
      }
    }

    recStack.delete(node);
    return false;
  };

  for (const node of graph.keys()) {
    if (hasCycle(node)) {
      return true;
    }
  }

  return false;
};
