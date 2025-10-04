import axios from 'axios';
import toast from 'react-hot-toast';

class AIVerificationService {
  constructor() {
    // Configure API base URL - defaults to localhost for development
    this.baseURL = import.meta.env.VITE_AI_SERVICE_URL || 'http://localhost:3001';
    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: 30000, // 30 second timeout for AI processing
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add request interceptor for logging
    this.client.interceptors.request.use(
      (config) => {
        console.log('AI Verification Request:', config.method?.toUpperCase(), config.url);
        return config;
      },
      (error) => {
        console.error('AI Verification Request Error:', error);
        return Promise.reject(error);
      }
    );

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => {
        console.log('AI Verification Response:', response.status, response.data);
        return response;
      },
      (error) => {
        console.error('AI Verification Response Error:', error.response?.data || error.message);
        
        // Handle specific error cases
        if (error.code === 'ECONNREFUSED') {
          toast.error('AI verification service is not available. Please check if the service is running.');
        } else if (error.response?.status === 429) {
          toast.error('Too many verification requests. Please try again later.');
        } else if (error.response?.status >= 500) {
          toast.error('AI verification service error. Please try again later.');
        } else {
          toast.error('Verification failed. Please check your input and try again.');
        }
        
        return Promise.reject(error);
      }
    );
  }

  /**
   * Verify a single task completion
   * @param {string} taskDescription - Original task requirements
   * @param {string} deliverySummary - What was delivered/completed
   * @returns {Promise<Object>} Verification result
   */
  async verifyTaskCompletion(taskDescription, deliverySummary) {
    try {
      const response = await this.client.post('/api/verification/verify', {
        taskDescription: taskDescription.trim(),
        deliverySummary: deliverySummary.trim(),
      });

      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.error || 'Verification failed');
      }
    } catch (error) {
      console.error('Task verification error:', error);
      throw error;
    }
  }

  /**
   * Verify multiple tasks in batch
   * @param {Array} tasks - Array of task objects with taskDescription and deliverySummary
   * @returns {Promise<Object>} Batch verification results
   */
  async verifyBatchTasks(tasks) {
    try {
      const response = await this.client.post('/api/verification/batch', {
        tasks: tasks.map(task => ({
          taskId: task.taskId || `task_${Date.now()}`,
          taskDescription: task.taskDescription.trim(),
          deliverySummary: task.deliverySummary.trim(),
        })),
      });

      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.error || 'Batch verification failed');
      }
    } catch (error) {
      console.error('Batch verification error:', error);
      throw error;
    }
  }

  /**
   * Check if the AI verification service is healthy
   * @returns {Promise<Object>} Health status
   */
  async checkHealth() {
    try {
      const response = await this.client.get('/api/health');
      return {
        status: 'healthy',
        data: response.data,
      };
    } catch (error) {
      console.error('Health check error:', error);
      return {
        status: 'unhealthy',
        error: error.message,
      };
    }
  }

  /**
   * Get detailed health information including AI service status
   * @returns {Promise<Object>} Detailed health status
   */
  async getDetailedHealth() {
    try {
      const response = await this.client.get('/api/health/detailed');
      return {
        status: 'healthy',
        data: response.data,
      };
    } catch (error) {
      console.error('Detailed health check error:', error);
      return {
        status: 'unhealthy',
        error: error.message,
      };
    }
  }

  /**
   * Get available AI models
   * @returns {Promise<Array>} Available models
   */
  async getAvailableModels() {
    try {
      const response = await this.client.get('/api/verification/models');
      return response.data.data.availableModels;
    } catch (error) {
      console.error('Get models error:', error);
      return ['gpt-3.5-turbo']; // fallback
    }
  }

  /**
   * Validate input data before sending to AI service
   * @param {string} taskDescription - Task description to validate
   * @param {string} deliverySummary - Delivery summary to validate
   * @returns {Object} Validation result
   */
  validateInput(taskDescription, deliverySummary) {
    const errors = [];

    if (!taskDescription || taskDescription.trim().length < 10) {
      errors.push('Task description must be at least 10 characters long');
    }

    if (!deliverySummary || deliverySummary.trim().length < 10) {
      errors.push('Delivery summary must be at least 10 characters long');
    }

    if (taskDescription && taskDescription.length > 10000) {
      errors.push('Task description must be less than 10,000 characters');
    }

    if (deliverySummary && deliverySummary.length > 10000) {
      errors.push('Delivery summary must be less than 10,000 characters');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Format verification result for display
   * @param {Object} result - Raw verification result from AI service
   * @returns {Object} Formatted result for UI
   */
  formatVerificationResult(result) {
    return {
      completionScore: result.completionScore,
      recommendation: result.recommendation,
      reasoning: result.reasoning,
      timestamp: result.timestamp,
      model: result.model,
      scoreColor: this.getScoreColor(result.completionScore),
      recommendationColor: this.getRecommendationColor(result.recommendation),
      scoreLabel: this.getScoreLabel(result.completionScore),
    };
  }

  /**
   * Get color class for completion score
   * @param {number} score - Completion score (0-100)
   * @returns {string} CSS color class
   */
  getScoreColor(score) {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  }

  /**
   * Get color class for recommendation
   * @param {string} recommendation - 'release' or 'dispute'
   * @returns {string} CSS color class
   */
  getRecommendationColor(recommendation) {
    return recommendation === 'release' ? 'text-green-600' : 'text-red-600';
  }

  /**
   * Get human-readable label for completion score
   * @param {number} score - Completion score (0-100)
   * @returns {string} Score label
   */
  getScoreLabel(score) {
    if (score >= 90) return 'Excellent';
    if (score >= 80) return 'Good';
    if (score >= 70) return 'Satisfactory';
    if (score >= 60) return 'Partial';
    return 'Poor';
  }
}

// Create and export a singleton instance
const aiVerificationService = new AIVerificationService();
export default aiVerificationService;
