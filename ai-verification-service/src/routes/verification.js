const express = require('express');
const { body, validationResult } = require('express-validator');
const AIVerificationService = require('../services/AIVerificationService');
const logger = require('../utils/logger');

const router = express.Router();
const aiService = new AIVerificationService();

// Validation middleware
const validateVerificationRequest = [
  body('taskDescription')
    .isString()
    .isLength({ min: 10, max: 10000 })
    .withMessage('Task description must be between 10 and 10,000 characters'),
  body('deliverySummary')
    .isString()
    .isLength({ min: 10, max: 10000 })
    .withMessage('Delivery summary must be between 10 and 10,000 characters')
];

/**
 * POST /api/verification/verify
 * Verify task completion using AI analysis
 */
router.post('/verify', validateVerificationRequest, async (req, res, next) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { taskDescription, deliverySummary } = req.body;

    logger.info('Verification request received', {
      taskLength: taskDescription.length,
      deliveryLength: deliverySummary.length,
      ip: req.ip
    });

    // Perform AI verification
    const result = await aiService.verifyTaskCompletion(taskDescription, deliverySummary);

    logger.info('Verification completed successfully', {
      completionScore: result.completionScore,
      recommendation: result.recommendation
    });

    res.json({
      success: true,
      data: result
    });

  } catch (error) {
    logger.error('Verification request failed', {
      error: error.message,
      stack: error.stack,
      ip: req.ip
    });

    next(error);
  }
});

/**
 * POST /api/verification/batch
 * Verify multiple tasks in batch
 */
router.post('/batch', [
  body('tasks')
    .isArray({ min: 1, max: 10 })
    .withMessage('Tasks must be an array with 1-10 items'),
  body('tasks.*.taskDescription')
    .isString()
    .isLength({ min: 10, max: 10000 }),
  body('tasks.*.deliverySummary')
    .isString()
    .isLength({ min: 10, max: 10000 }),
  body('tasks.*.taskId')
    .optional()
    .isString()
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { tasks } = req.body;

    logger.info('Batch verification request received', {
      taskCount: tasks.length,
      ip: req.ip
    });

    // Process tasks sequentially to avoid rate limits
    const results = [];
    for (let i = 0; i < tasks.length; i++) {
      try {
        const result = await aiService.verifyTaskCompletion(
          tasks[i].taskDescription,
          tasks[i].deliverySummary
        );
        
        results.push({
          taskId: tasks[i].taskId || `task_${i}`,
          ...result
        });
      } catch (error) {
        results.push({
          taskId: tasks[i].taskId || `task_${i}`,
          error: error.message
        });
      }
    }

    res.json({
      success: true,
      data: {
        totalTasks: tasks.length,
        completedTasks: results.filter(r => !r.error).length,
        failedTasks: results.filter(r => r.error).length,
        results
      }
    });

  } catch (error) {
    logger.error('Batch verification request failed', {
      error: error.message,
      stack: error.stack
    });
    next(error);
  }
});

/**
 * GET /api/verification/models
 * Get available AI models
 */
router.get('/models', (req, res) => {
  res.json({
    success: true,
    data: {
      currentModel: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
      availableModels: [
        'gpt-3.5-turbo',
        'gpt-4',
        'gpt-4-turbo-preview'
      ],
      defaultModel: 'gpt-3.5-turbo'
    }
  });
});

module.exports = router;
