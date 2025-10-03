const request = require('supertest');
const app = require('../src/server');

describe('AI Verification Service', () => {
  describe('POST /api/verification/verify', () => {
    it('should verify a task completion successfully', async () => {
      const mockTaskData = {
        taskDescription: 'Create a simple website with contact form',
        deliverySummary: 'Built a responsive website using HTML, CSS, and JavaScript with a working contact form that validates email addresses.'
      };

      const response = await request(app)
        .post('/api/verification/verify')
        .send(mockTaskData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('completionScore');
      expect(response.body.data).toHaveProperty('recommendation');
      expect(response.body.data).toHaveProperty('reasoning');
      expect(response.body.data).toHaveProperty('timestamp');
      expect(response.body.data.completionScore).toBeGreaterThanOrEqual(0);
      expect(response.body.data.completionScore).toBeLessThanOrEqual(100);
      expect(['release', 'dispute']).toContain(response.body.data.recommendation);
    });

    it('should return validation error for missing task description', async () => {
      const mockTaskData = {
        deliverySummary: 'Built a website'
      };

      const response = await request(app)
        .post('/api/verification/verify')
        .send(mockTaskData)
        .expect(400);

      expect(response.body.error).toBe('Validation failed');
      expect(response.body.details).toBeDefined();
    });

    it('should return validation error for missing delivery summary', async () => {
      const mockTaskData = {
        taskDescription: 'Create a website'
      };

      const response = await request(app)
        .post('/api/verification/verify')
        .send(mockTaskData)
        .expect(400);

      expect(response.body.error).toBe('Validation failed');
    });

    it('should return validation error for invalid input lengths', async () => {
      const mockTaskData = {
        taskDescription: 'Short',
        deliverySummary: 'Short'
      };

      const response = await request(app)
        .post('/api/verification/verify')
        .send(mockTaskData)
        .expect(400);

      expect(response.body.error).toBe('Validation failed');
    });
  });

  describe('POST /api/verification/batch', () => {
    it('should process batch verification successfully', async () => {
      const mockBatchData = {
        tasks: [
          {
            taskId: 'task_1',
            taskDescription: 'Create a logo design',
            deliverySummary: 'Delivered 3 logo variations in PNG and SVG formats'
          },
          {
            taskId: 'task_2',
            taskDescription: 'Write marketing copy',
            deliverySummary: 'Created compelling marketing copy for homepage and product pages'
          }
        ]
      };

      const response = await request(app)
        .post('/api/verification/batch')
        .send(mockBatchData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('totalTasks', 2);
      expect(response.body.data).toHaveProperty('completedTasks');
      expect(response.body.data).toHaveProperty('failedTasks');
      expect(response.body.data.results).toHaveLength(2);
    });

    it('should return validation error for empty tasks array', async () => {
      const mockBatchData = {
        tasks: []
      };

      const response = await request(app)
        .post('/api/verification/batch')
        .send(mockBatchData)
        .expect(400);

      expect(response.body.error).toBe('Validation failed');
    });
  });

  describe('GET /api/health', () => {
    it('should return health status', async () => {
      const response = await request(app)
        .get('/api/health')
        .expect(200);

      expect(response.body.message).toBe('OK');
      expect(response.body).toHaveProperty('uptime');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('service');
    });
  });

  describe('GET /api/health/detailed', () => {
    it('should return detailed health status', async () => {
      const response = await request(app)
        .get('/api/health/detailed');

      expect(response.body).toHaveProperty('status');
      expect(response.body).toHaveProperty('components');
      expect(response.body.components).toHaveProperty('api');
      expect(response.body.components).toHaveProperty('ai');
    });
  });

  describe('GET /api/verification/models', () => {
    it('should return available models', async () => {
      const response = await request(app)
        .get('/api/verification/models')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('currentModel');
      expect(response.body.data).toHaveProperty('availableModels');
      expect(Array.isArray(response.body.data.availableModels)).toBe(true);
    });
  });

  describe('GET /', () => {
    it('should return service information', async () => {
      const response = await request(app)
        .get('/')
        .expect(200);

      expect(response.body).toHaveProperty('service');
      expect(response.body).toHaveProperty('version');
      expect(response.body).toHaveProperty('status');
      expect(response.body).toHaveProperty('endpoints');
    });
  });

  describe('404 handler', () => {
    it('should return 404 for unknown routes', async () => {
      const response = await request(app)
        .get('/api/unknown')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toHaveProperty('message');
    });
  });
});
