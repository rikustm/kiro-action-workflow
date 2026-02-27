import mongoose from 'mongoose';

const taskTypeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Task type name is required'],
    trim: true,
    unique: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  field_schema: {
    type: mongoose.Schema.Types.Mixed,
    required: [true, 'Field schema is required'],
    default: {}
  },
  icon: {
    type: String,
    trim: true,
    maxlength: [50, 'Icon cannot exceed 50 characters']
  },
  is_active: {
    type: Boolean,
    default: true,
    required: true
  }
}, {
  timestamps: true
});

// Indexes
taskTypeSchema.index({ is_active: 1 });
taskTypeSchema.index({ name: 1 });

const TaskType = mongoose.model('TaskType', taskTypeSchema);

export default TaskType;
