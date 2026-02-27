import mongoose from 'mongoose';

const workflowVersionSchema = new mongoose.Schema({
  workflow_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Workflow',
    required: [true, 'Workflow ID is required'],
    index: true
  },
  version_number: {
    type: Number,
    required: [true, 'Version number is required'],
    min: [1, 'Version number must be at least 1']
  },
  change_note: {
    type: String,
    trim: true,
    maxlength: [1000, 'Change note cannot exceed 1000 characters']
  },
  created_by: {
    type: String,
    required: [true, 'Creator is required']
  },
  is_published: {
    type: Boolean,
    default: false,
    required: true
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: false }
});

// Compound index for workflow versions
workflowVersionSchema.index({ workflow_id: 1, version_number: 1 }, { unique: true });
workflowVersionSchema.index({ workflow_id: 1, is_published: 1 });

const WorkflowVersion = mongoose.model('WorkflowVersion', workflowVersionSchema);

export default WorkflowVersion;
