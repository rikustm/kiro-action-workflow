import express from 'express';
import Joi from 'joi';
import Workflow from '../models/Workflow.js';
import WorkflowVersion from '../models/WorkflowVersion.js';
import Permission from '../models/Permission.js';
import { validate } from '../middleware/validate.js';
import { authenticate } from '../middleware/auth.js';
import { checkWorkflowPermission } from '../middleware/permissions.js';

const router = express.Router();

const createWorkflowSchema = Joi.object({
  title: Joi.string().required().trim(),
  description: Joi.string().allow('').trim()
});

const updateWorkflowSchema = Joi.object({
  title: Joi.string().trim(),
  description: Joi.string().allow('').trim()
}).min(1);

router.post('/', authenticate, validate(createWorkflowSchema), async (req, res) => {
  try {
    const { title, description } = req.body;

    const workflow = await Workflow.create({
      title,
      description,
      status: 'Draft',
      created_by: req.user._id
    });

    const version = await WorkflowVersion.create({
      workflow_id: workflow._id,
      version_number: 1,
      created_by: req.user._id,
      is_published: false
    });

    workflow.current_version_id = version._id;
    await workflow.save();

    await Permission.create({
      workflow_id: workflow._id,
      user_id: req.user._id,
      role: 'Admin'
    });

    res.status(201).json({
      status: 'success',
      data: {
        workflow: {
          id: workflow._id,
          title: workflow.title,
          description: workflow.description,
          status: workflow.status,
          current_version_id: workflow.current_version_id,
          created_at: workflow.createdAt
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to create workflow'
    });
  }
});

router.get('/', authenticate, async (req, res) => {
  try {
    const { status, owner, page = 1, limit = 20 } = req.query;
    
    const userPermissions = await Permission.find({ user_id: req.user._id })
      .select('workflow_id');
    const workflowIds = userPermissions.map(p => p.workflow_id);

    const query = { _id: { $in: workflowIds } };
    
    if (status) {
      query.status = status;
    }
    
    if (owner) {
      query.created_by = owner;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const workflows = await Workflow.find(query)
      .populate('created_by', 'email')
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Workflow.countDocuments(query);

    res.json({
      status: 'success',
      data: {
        workflows: workflows.map(w => ({
          id: w._id,
          title: w.title,
          description: w.description,
          status: w.status,
          current_version_id: w.current_version_id,
          owner: w.created_by?.email,
          updated_at: w.updatedAt
        })),
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch workflows'
    });
  }
});

router.get('/:id', authenticate, checkWorkflowPermission('Viewer'), async (req, res) => {
  try {
    const workflow = await Workflow.findById(req.params.id)
      .populate('created_by', 'email')
      .populate('current_version_id');

    if (!workflow) {
      return res.status(404).json({
        status: 'error',
        message: 'Workflow not found'
      });
    }

    res.json({
      status: 'success',
      data: {
        workflow: {
          id: workflow._id,
          title: workflow.title,
          description: workflow.description,
          status: workflow.status,
          current_version_id: workflow.current_version_id,
          owner: workflow.created_by?.email,
          created_at: workflow.createdAt,
          updated_at: workflow.updatedAt
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch workflow'
    });
  }
});

router.patch('/:id', authenticate, checkWorkflowPermission('Editor'), validate(updateWorkflowSchema), async (req, res) => {
  try {
    const { title, description } = req.body;
    
    const workflow = await Workflow.findById(req.params.id);
    
    if (!workflow) {
      return res.status(404).json({
        status: 'error',
        message: 'Workflow not found'
      });
    }

    if (workflow.status === 'Published') {
      const newVersion = await WorkflowVersion.create({
        workflow_id: workflow._id,
        version_number: await WorkflowVersion.countDocuments({ workflow_id: workflow._id }) + 1,
        created_by: req.user._id,
        is_published: false
      });
      
      workflow.current_version_id = newVersion._id;
      workflow.status = 'Draft';
    }

    if (title !== undefined) workflow.title = title;
    if (description !== undefined) workflow.description = description;
    
    await workflow.save();

    res.json({
      status: 'success',
      data: {
        workflow: {
          id: workflow._id,
          title: workflow.title,
          description: workflow.description,
          status: workflow.status,
          current_version_id: workflow.current_version_id,
          updated_at: workflow.updatedAt
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to update workflow'
    });
  }
});

router.delete('/:id', authenticate, checkWorkflowPermission('Admin'), async (req, res) => {
  try {
    const workflow = await Workflow.findById(req.params.id);
    
    if (!workflow) {
      return res.status(404).json({
        status: 'error',
        message: 'Workflow not found'
      });
    }

    workflow.status = 'Archived';
    await workflow.save();

    res.json({
      status: 'success',
      message: 'Workflow archived successfully'
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to archive workflow'
    });
  }
});

router.post('/:id/duplicate', authenticate, checkWorkflowPermission('Viewer'), async (req, res) => {
  try {
    const originalWorkflow = await Workflow.findById(req.params.id);
    
    if (!originalWorkflow) {
      return res.status(404).json({
        status: 'error',
        message: 'Workflow not found'
      });
    }

    const newWorkflow = await Workflow.create({
      title: `${originalWorkflow.title} (Copy)`,
      description: originalWorkflow.description,
      status: 'Draft',
      created_by: req.user._id
    });

    const newVersion = await WorkflowVersion.create({
      workflow_id: newWorkflow._id,
      version_number: 1,
      created_by: req.user._id,
      is_published: false
    });

    newWorkflow.current_version_id = newVersion._id;
    await newWorkflow.save();

    await Permission.create({
      workflow_id: newWorkflow._id,
      user_id: req.user._id,
      role: 'Admin'
    });

    res.status(201).json({
      status: 'success',
      data: {
        workflow: {
          id: newWorkflow._id,
          title: newWorkflow.title,
          description: newWorkflow.description,
          status: newWorkflow.status,
          current_version_id: newWorkflow.current_version_id
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to duplicate workflow'
    });
  }
});

export default router;
