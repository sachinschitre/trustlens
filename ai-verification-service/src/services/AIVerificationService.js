const OpenAI = require('openai');
const logger = require('../utils/logger');

class AIVerificationService {
  constructor() {
    this.apiKey = process.env.OPENAI_API_KEY;
    this.model = process.env.OPENAI_MODEL || 'gpt-3.5-turbo';
    this.mockMode = !this.apiKey || this.apiKey === 'test-key';
    
    if (!this.mockMode) {
      this.openai = new OpenAI({
        apiKey: this.apiKey,
      });
    }
    
    logger.info('AI Verification Service initialized', {
      mode: this.mockMode ? 'mock' : 'production',
      model: this.model
    });
  }

  /**
   * Verify task completion by comparing task description with delivery summary
   * @param {string} taskDescription - Original task requirements
   * @param {string} deliverySummary - What was delivered/completed
   * @returns {Promise<Object>} Verification result with score and recommendation
   */
  async verifyTaskCompletion(taskDescription, deliverySummary) {
    try {
      logger.info('Starting AI verification process', {
        taskLength: taskDescription.length,
        deliveryLength: deliverySummary.length,
        mode: this.mockMode ? 'mock' : 'production'
      });

      if (this.mockMode) {
        return this.mockVerification(taskDescription, deliverySummary);
      }

      const prompt = this.buildVerificationPrompt(taskDescription, deliverySummary);
      
      const response = await this.openai.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: 'system',
            content: this.getSystemPrompt()
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.1, // Low temperature for consistent scoring
        max_tokens: 500,
        response_format: { type: "json_object" }
      });

      const result = JSON.parse(response.choices[0].message.content);
      
      logger.info('AI verification completed', {
        completionScore: result.completionScore,
        recommendation: result.recommendation
      });

      return this.validateAndFormatResult(result);

    } catch (error) {
      logger.error('AI verification failed', {
        error: error.message,
        stack: error.stack
      });
      throw new Error(`Verification failed: ${error.message}`);
    }
  }

  /**
   * Mock verification for demo purposes when no API key is available
   */
  mockVerification(taskDescription, deliverySummary) {
    logger.info('Using mock AI verification');
    
    // Simple mock logic based on keyword matching
    const taskWords = taskDescription.toLowerCase().split(/\s+/);
    const deliveryWords = deliverySummary.toLowerCase().split(/\s+/);
    
    // Calculate similarity based on common words
    const commonWords = taskWords.filter(word => 
      deliveryWords.includes(word) && word.length > 3
    );
    
    const similarity = commonWords.length / Math.max(taskWords.length, deliveryWords.length);
    
    // Generate mock score and recommendation
    let completionScore;
    let recommendation;
    
    if (similarity > 0.7) {
      completionScore = Math.floor(75 + Math.random() * 25); // 75-100
      recommendation = 'release';
    } else if (similarity > 0.4) {
      completionScore = Math.floor(50 + Math.random() * 25); // 50-75
      recommendation = Math.random() > 0.5 ? 'release' : 'dispute';
    } else {
      completionScore = Math.floor(20 + Math.random() * 30); // 20-50
      recommendation = 'dispute';
    }
    
    const mockResult = {
      completionScore,
      recommendation,
      reasoning: `Mock analysis: Found ${commonWords.length} matching keywords out of ${Math.max(taskWords.length, deliveryWords.length)} total words. Similarity score: ${(similarity * 100).toFixed(1)}%. Based on this analysis, the task appears to be ${completionScore >= 70 ? 'well completed' : 'incompletely delivered'}.`,
      timestamp: new Date().toISOString(),
      model: 'mock-ai-verifier-v1.0'
    };
    
    logger.info('Mock verification completed', {
      completionScore: mockResult.completionScore,
      recommendation: mockResult.recommendation
    });
    
    return this.validateAndFormatResult(mockResult);
  }

  /**
   * Build the verification prompt for the AI model
   */
  buildVerificationPrompt(taskDescription, deliverySummary) {
    return `
Please analyze the following task completion scenario and provide a verification score and recommendation.

TASK DESCRIPTION:
${taskDescription}

DELIVERY SUMMARY:
${deliverySummary}

Please evaluate:
1. How well the delivery matches the original task requirements
2. Quality and completeness of the work delivered
3. Any missing elements or deviations from the original task

Respond with a JSON object containing:
- completionScore: A number from 0-100 representing how well the task was completed
- recommendation: Either "release" or "dispute" based on the quality assessment
- reasoning: A brief explanation of the score and recommendation (max 200 characters)

Scoring Guidelines:
- 90-100: Excellent completion, all requirements met and exceeded
- 80-89: Good completion, all major requirements met with minor gaps
- 70-79: Satisfactory completion, most requirements met with some issues
- 60-69: Partial completion, significant gaps or quality issues
- 0-59: Poor completion, major requirements not met

Recommendation Guidelines:
- "release": Score >= 70 and task substantially completed
- "dispute": Score < 70 or major requirements not fulfilled
`;
  }

  /**
   * Get the system prompt for consistent AI behavior
   */
  getSystemPrompt() {
    return `You are an expert project manager and quality assurance specialist. Your role is to objectively evaluate task completion by comparing delivered work against original requirements. 

You must:
1. Be fair and impartial in your assessment
2. Focus on measurable deliverables and requirements
3. Consider both completeness and quality
4. Provide clear reasoning for your decisions
5. Always respond with valid JSON format

Be thorough but concise in your analysis.`;
  }

  /**
   * Validate and format the AI response
   */
  validateAndFormatResult(result) {
    // Validate completion score
    if (typeof result.completionScore !== 'number' || 
        result.completionScore < 0 || 
        result.completionScore > 100) {
      throw new Error('Invalid completion score received from AI');
    }

    // Validate recommendation
    if (!['release', 'dispute'].includes(result.recommendation)) {
      throw new Error('Invalid recommendation received from AI');
    }

    // Ensure reasoning exists
    if (!result.reasoning || result.reasoning.length > 200) {
      result.reasoning = 'AI analysis completed';
    }

    return {
      completionScore: Math.round(result.completionScore),
      recommendation: result.recommendation,
      reasoning: result.reasoning,
      timestamp: new Date().toISOString(),
      model: this.model
    };
  }

  /**
   * Health check for the AI service
   */
  async healthCheck() {
    try {
      // Simple test request to verify API connectivity
      await this.openai.chat.completions.create({
        model: this.model,
        messages: [{ role: 'user', content: 'Hello' }],
        max_tokens: 5
      });
      
      return {
        status: 'healthy',
        model: this.model,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      logger.error('AI service health check failed', { error: error.message });
      return {
        status: 'unhealthy',
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }
}

module.exports = AIVerificationService;
