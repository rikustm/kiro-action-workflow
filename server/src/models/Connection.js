import mongoose from 'mongoose';

const connectionSchema = new mongoose.Schema({
  workflow_version_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'WorkflowVersion',
    required: [true, 'Workflow version ID is required'],
    index: true
  },
  from_node_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Node',
    required: [true, 'From node ID is required']
  },
  to_node_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Node',
    required: [true, 'To node ID is required']
  },
  label: {
    type: String,
    trim: true,
    maxlength: [100, 'Label cannot exceed 100 characters']
  }
}, {
  timestamps: true
});

// Validation: prevent self-loops
connectionSchema.pre('save', function(next) {
  if (this.from_node_id.equals(this.to_node_id)) {
    next(new Error('Self-loops are not allowed'));
  } else {
    next();
  }
});

// Indexes for performance
connectionSchema.index({ workflow_version_id: 1 });
connectionSchema.index({ from_node_id: 1 });
connectionSchema.index({ to_node_id: 1 });
connectionSchema.index({ from_node_id: 1, to_node_id: 1 }, { unique: true });

const Connection = mongoose.model('Connection', connectionSchema);

export default Connection;
