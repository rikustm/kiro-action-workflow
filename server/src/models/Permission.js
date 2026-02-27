import mongoose from 'mongoose';

const permissionSchema = new mongoose.Schema({
  workflow_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Workflow',
    required: true
  },
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  role: {
    type: String,
    enum: ['Viewer', 'Editor', 'Admin'],
    required: true
  }
}, {
  timestamps: true
});

permissionSchema.index({ workflow_id: 1, user_id: 1 }, { unique: true });
permissionSchema.index({ user_id: 1 });

const Permission = mongoose.model('Permission', permissionSchema);

export default Permission;
