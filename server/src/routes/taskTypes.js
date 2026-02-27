import express from 'express';
import Joi from 'joi';
import TaskType from '../models/TaskType.js';
import { validate } from '../middleware/validate.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

const fieldSchemaItem = Joi.object({
  name: Joi.string().required(),
  label: Joi.string().required(),
  type: Joi.string().valid('text', 'number', 'boolean', 'select', 'multi-select', 'date').required(),
  required: Joi.boolean().default(false),
  options: Joi.array().items(Joi.string()).when('type', {
    is: Joi.string().valid('select', 'multi-select'),
    then: Joi.required(),
    otherwise: Joi.optional()
  })
});

const createTaskTypeSchema = Joi.object({
  name: Joi.string().required().trim(),
  description: Joi.string().allow('').trim(),
  field_schema: Joi.array().items(fieldSchemaItem).required(),
  icon: Joi.string().allow('').trim()
});

const updateTaskTypeSchema = Joi.object({
  name: Joi.string().trim(),
  description: Joi.string().allow('').trim(),
  field_schema: Joi.array().items(fieldSchemaItem),
  icon: Joi.string().allow('').trim(),
  is_active: Joi.boolean()
}).min(1);

router.get('/', authenticate, async (req, res) => {
  try {
    const { active_only } = req.query;
    const query = active_only === 'true' ? { is_active: true } : {};

    const taskTypes = await TaskType.find(query).sort({ name: 1 });

    res.json({
      status: 'success',
      data: { taskTypes }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch task types'
    });
  }
});

router.post('/', authenticate, requireAdmin, validate(createTaskTypeSchema), async (req, res) => {
  try {
    const taskType = await TaskType.create({
      ...req.body,
      is_active: true
    });

    res.status(201).json({
      status: 'success',
      data: { taskType }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to create task type'
    });
  }
});

router.patch('/:id', authenticate, requireAdmin, validate(updateTaskTypeSchema), async (req, res) => {
  try {
    const taskType = await TaskType.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!taskType) {
      return res.status(404).json({
        status: 'error',
        message: 'Task type not found'
      });
    }

    res.json({
      status: 'success',
      data: { taskType }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to update task type'
    });
  }
});

router.delete('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const taskType = await TaskType.findByIdAndUpdate(
      req.params.id,
      { is_active: false },
      { new: true }
    );

    if (!taskType) {
      return res.status(404).json({
        status: 'error',
        message: 'Task type not found'
      });
    }

    res.json({
      status: 'success',
      message: 'Task type deactivated'
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to deactivate task type'
    });
  }
});

export default router;
