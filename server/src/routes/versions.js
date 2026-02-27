import express from 'express';
import Joi from 'joi';
import Workflow from '../models/Workflow.js';
import WorkflowVersion from '../models/WorkflowVersion.js';
import { validate } from '../middleware/validate.js';
import { authenticate } from '../middleware/auth.js';
import { checkWorkflowPermission } from '../middleware/permissions.js';

const router = express.Router({ mergeParams: true });

const createVersionSchema = Joi.object({
  change_note: Joi.string().allow('').trim()
});

router.get('/', authenticate, checkWorkflowPermission('Viewer'), async (req, res) => {
  try {
    const versions = await WorkflowVersion.find({ 
      workflow_id: req.params.id 
    })
      .populate('created_by', 'email')
      .sort({ version_number: -1 });

    res.json({
      status: 'success',
      data: {
        versions: versions.map(v => ({
          id: v._id,
          version_number: v.version_number,
          change_note: v.change_note,
          is_published: v.is_published,
          created_by: v.created_by?.email,
          created_at: v.createdAt
        }))
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch versions'
    });
  }
});

router.get('/:versionId', authenticate, checkWorkflowPermission('Viewer'), async (req, res) => {
  try {
    const version = await WorkflowVersion.findOne({
      _id: req.params.versionId,
      workflow_id: req.params.id
    }).populate('created_by', 'email');

    if (!version) {
      return res.status(404).json({
        status: 'error',
        message: 'Version not found'
      });
    }

    res.json({
      status: 'success',
      data: {
        version: {
          id: version._id,
          version_number: version.version_number,
          change_note: version.change_note,
          is_published: version.is_published,
          created_by: version.created_by?.email,
          created_at: version.createdAt
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch version'
    });
  }
});

router.post('/', authenticate, checkWorkflowPermission('Editor'), validate(createVersionSchema), async (req, res) => {
  try {
    const { change_note } = req.body;
    
    const workflow = await Workflow.findById(req.params.id);
    if (!workflow) {
      return res.status(404).json({
        status: 'error',
        message: 'Workflow not found'
      });
    }

    const versionCount = await WorkflowVersion.countDocuments({ 
      workflow_id: workflow._id 
    });

    const newVersion = await WorkflowVersion.create({
      workflow_id: workflow._id,
      version_number: versionCount + 1,
      change_note: change_note || '',
      created_by: req.user._id,
      is_published: false
    });

    workflow.current_version_id = newVersion._id;
    workflow.status = 'Draft';
    await workflow.save();

    res.status(201).json({
      status: 'success',
      data: {
        version: {
          id: newVersion._id,
          version_number: newVersion.version_number,
          change_note: newVersion.change_note,
          is_published: newVersion.is_published,
          created_at: newVersion.createdAt
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to create version'
    });
  }
});

router.post('/:versionId/publish', authenticate, checkWorkflowPermission('Admin'), async (req, res) => {
  try {
    const version = await WorkflowVersion.findOne({
      _id: req.params.versionId,
      workflow_id: req.params.id
    });

    if (!version) {
      return res.status(404).json({
        status: 'error',
        message: 'Version not found'
      });
    }

    if (version.is_published) {
      return res.status(400).json({
        status: 'error',
        message: 'Version is already published'
      });
    }

    await WorkflowVersion.updateMany(
      { workflow_id: req.params.id, is_published: true },
      { is_published: false }
    );

    version.is_published = true;
    await version.save();

    const workflow = await Workflow.findById(req.params.id);
    workflow.status = 'Published';
    workflow.current_version_id = version._id;
    await workflow.save();

    res.json({
      status: 'success',
      data: {
        version: {
          id: version._id,
          version_number: version.version_number,
          is_published: version.is_published
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to publish version'
    });
  }
});

export default router;
