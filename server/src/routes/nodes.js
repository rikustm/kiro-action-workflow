import express from 'express';
import Joi from 'joi';
import Node from '../models/Node.js';
import TaskType from '../models/TaskType.js';
import { validate } from '../middleware/validate.js';
import { authenticate } from '../middleware/auth.js';
import { checkWorkflowPermission } from '../middleware/permissions.js';

const router = express.Router({ mergeParams: true });

const createNodeSchema = Joi.object({
  node_type: Joi.string().valid('TASK', 'DECISION').required(),
  name: Joi.string().required().trim(),
  description: Joi.string().allow('').trim(),
  position_x: Joi.number().default(0),
  position_y: Joi.number().default(0),
  task_type_id: Joi.string().when('node_type', {
    is: 'TASK',
    then: Joi.required(),
    otherwise: Joi.forbidden()
  }),
  task_data: Joi.object().when('node_type', {
    is: 'TASK',
    then: Joi.optional(),
    otherwise: Joi.forbidden()
  }),
  decision_question: Joi.string().when('node_type', {
    is: 'DECISION',
    then: Joi.optional(),
    otherwise: Joi.forbidden()
  })
});

const updateNodeSchema = Joi.object({
  name: Joi.string().trim(),
  description: Joi.string().allow('').trim(),
  task_data: Joi.object(),
  decision_question: Joi.string().allow('').trim()
}).min(1);

const updatePositionSchema = Joi.object({
  position_x: Joi.number().required(),
  position_y: Joi.number().required()
});

router.post('/', authenticate, checkWorkflowPermission('Editor'), validate(createNodeSchema), async (req, res) => {
  try {
    const { node_type, task_type_id, ...nodeData } = req.body;

    if (node_type === 'TASK' && task_type_id) {
      const taskType = await TaskType.findById(task_type_id);
      if (!taskType || !taskType.is_active) {
        return res.status(400).json({
          status: 'error',
          message: 'Invalid or inactive task type'
        });
      }
    }

    const node = await Node.create({
      workflow_version_id: req.params.versionId,
      node_type,
      task_type_id: node_type === 'TASK' ? task_type_id : undefined,
      ...nodeData
    });

    res.status(201).json({
      status: 'success',
      data: { node }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to create node'
    });
  }
});

router.patch('/:nodeId', authenticate, checkWorkflowPermission('Editor'), validate(updateNodeSchema), async (req, res) => {
  try {
    const node = await Node.findOne({
      _id: req.params.nodeId,
      workflow_version_id: req.params.versionId
    });

    if (!node) {
      return res.status(404).json({
        status: 'error',
        message: 'Node not found'
      });
    }

    Object.assign(node, req.body);
    await node.save();

    res.json({
      status: 'success',
      data: { node }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to update node'
    });
  }
});

router.patch('/:nodeId/position', authenticate, checkWorkflowPermission('Editor'), validate(updatePositionSchema), async (req, res) => {
  try {
    const node = await Node.findOneAndUpdate(
      {
        _id: req.params.nodeId,
        workflow_version_id: req.params.versionId
      },
      {
        position_x: req.body.position_x,
        position_y: req.body.position_y
      },
      { new: true }
    );

    if (!node) {
      return res.status(404).json({
        status: 'error',
        message: 'Node not found'
      });
    }

    res.json({
      status: 'success',
      data: { node }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to update node position'
    });
  }
});

router.delete('/:nodeId', authenticate, checkWorkflowPermission('Editor'), async (req, res) => {
  try {
    const node = await Node.findOneAndDelete({
      _id: req.params.nodeId,
      workflow_version_id: req.params.versionId
    });

    if (!node) {
      return res.status(404).json({
        status: 'error',
        message: 'Node not found'
      });
    }

    res.json({
      status: 'success',
      message: 'Node deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to delete node'
    });
  }
});

router.get('/', authenticate, checkWorkflowPermission('Viewer'), async (req, res) => {
  try {
    const nodes = await Node.find({
      workflow_version_id: req.params.versionId
    }).populate('task_type_id');

    res.json({
      status: 'success',
      data: { nodes }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch nodes'
    });
  }
});

export default router;
