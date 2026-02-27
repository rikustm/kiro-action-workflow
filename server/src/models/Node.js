import mongoose from 'mongoose';

// Base Node schema
const nodeSchema = new mongoose.Schema({
  workflow_version_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'WorkflowVersion',
    required: [true, 'Workflow version ID is required'],
    index: true
  },
  node_type: {
    type: String,
    enum: ['TASK', 'DECISION'],
    required: [true, 'Node type is required']
  },
  name: {
    type: String,
    required: [true, 'Node name is required'],
    trim: true,
    maxlength: [200, 'Name cannot exceed 200 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  position_x: {
    type: Number,
    default: 0
  },
  position_y: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true,
  discriminatorKey: 'node_type'
});

// Indexes
nodeSchema.index({ workflow_version_id: 1, node_type: 1 });

const Node = mongoose.model('Node', nodeSchema);

// TaskNode discriminator
const taskNodeSchema = new mongoose.Schema({
  task_type_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TaskType',
    required: [true, 'Task type ID is required']
  },
  task_data: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
});

const TaskNode = Node.discriminator('TASK', taskNodeSchema);

// DecisionNode discriminator
const decisionNodeSchema = new mongoose.Schema({
  decision_question: {
    type: String,
    trim: true,
    maxlength: [500, 'Decision question cannot exceed 500 characters']
  }
});

const DecisionNode = Node.discriminator('DECISION', decisionNodeSchema);

export { Node, TaskNode, DecisionNode };
export default Node;
