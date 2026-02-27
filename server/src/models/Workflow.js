import mongoose from 'mongoose';

const workflowSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Workflow title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  status: {
    type: String,
    enum: ['Draft', 'Published', 'Archived'],
    default: 'Draft',
    required: true
  },
  current_version_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'WorkflowVersion'
  },
  created_by: {
    type: String,
    required: [true, 'Creator is required']
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

// Indexes for performance
workflowSchema.index({ created_by: 1, status: 1 });
workflowSchema.index({ status: 1, updated_at: -1 });
workflowSchema.index({ title: 'text' });

const Workflow = mongoose.model('Workflow', workflowSchema);

export default Workflow;
