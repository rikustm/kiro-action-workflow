import express from 'express';
import Joi from 'joi';
import Connection from '../models/Connection.js';
import Node from '../models/Node.js';
import { validate } from '../middleware/validate.js';
import { authenticate } from '../middleware/auth.js';
import { checkWorkflowPermission } from '../middleware/permissions.js';
import { detectCycle } from '../utils/cycleDetection.js';

const router = express.Router({ mergeParams: true });

const createConnectionSchema = Joi.object({
  from_node_id: Joi.string().required(),
  to_node_id: Joi.string().required(),
  label: Joi.string().allow('').trim()
});

const updateConnectionSchema = Joi.object({
  label: Joi.string().allow('').trim()
});

router.post('/', authenticate, checkWorkflowPermission('Editor'), validate(createConnectionSchema), async (req, res) => {
  try {
    const { from_node_id, to_node_id, label } = req.body;

    if (from_node_id === to_node_id) {
      return res.status(400).json({
        status: 'error',
        message: 'Self-loops are not allowed'
      });
    }

    const fromNode = await Node.findOne({
      _id: from_node_id,
      workflow_version_id: req.params.versionId
    });

    const toNode = await Node.findOne({
      _id: to_node_id,
      workflow_version_id: req.params.versionId
    });

    if (!fromNode || !toNode) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid node IDs'
      });
    }

    const hasCycle = await detectCycle(req.params.versionId, from_node_id, to_node_id);
    if (hasCycle) {
      return res.status(400).json({
        status: 'error',
        message: 'Connection would create a circular flow'
      });
    }

    const connection = await Connection.create({
      workflow_version_id: req.params.versionId,
      from_node_id,
      to_node_id,
      label: label || ''
    });

    res.status(201).json({
      status: 'success',
      data: { connection }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to create connection'
    });
  }
});

router.patch('/:connectionId', authenticate, checkWorkflowPermission('Editor'), validate(updateConnectionSchema), async (req, res) => {
  try {
    const connection = await Connection.findOneAndUpdate(
      {
        _id: req.params.connectionId,
        workflow_version_id: req.params.versionId
      },
      { label: req.body.label },
      { new: true }
    );

    if (!connection) {
      return res.status(404).json({
        status: 'error',
        message: 'Connection not found'
      });
    }

    res.json({
      status: 'success',
      data: { connection }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to update connection'
    });
  }
});

router.delete('/:connectionId', authenticate, checkWorkflowPermission('Editor'), async (req, res) => {
  try {
    const connection = await Connection.findOneAndDelete({
      _id: req.params.connectionId,
      workflow_version_id: req.params.versionId
    });

    if (!connection) {
      return res.status(404).json({
        status: 'error',
        message: 'Connection not found'
      });
    }

    res.json({
      status: 'success',
      message: 'Connection deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to delete connection'
    });
  }
});

router.get('/', authenticate, checkWorkflowPermission('Viewer'), async (req, res) => {
  try {
    const connections = await Connection.find({
      workflow_version_id: req.params.versionId
    });

    res.json({
      status: 'success',
      data: { connections }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch connections'
    });
  }
});

export default router;
