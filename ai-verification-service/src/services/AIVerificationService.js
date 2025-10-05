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
    
    // Enhanced mock logic with more balanced scoring
    const taskWords = taskDescription.toLowerCase().split(/\s+/).filter(word => word.length > 3);
    const deliveryWords = deliverySummary.toLowerCase().split(/\s+/).filter(word => word.length > 3);
    
    // Calculate similarity based on common words
    const commonWords = taskWords.filter(word => deliveryWords.includes(word));
    const similarity = commonWords.length / Math.max(taskWords.length, deliveryWords.length, 1);
    
    // Enhanced scoring logic with more realistic distribution
    let completionScore;
    let recommendation;
    
    // Add some randomness and context awareness
    const taskLength = taskDescription.length;
    const deliveryLength = deliverySummary.length;
    const lengthRatio = deliveryLength / Math.max(taskLength, 1);
    
    // Base score from similarity
    let baseScore = similarity * 100;
    
    // Adjust based on delivery length (more detailed delivery = higher score)
    if (lengthRatio > 1.5) baseScore += 10; // Detailed delivery
    if (lengthRatio < 0.5) baseScore -= 15; // Too brief
    
    // Add some realistic variance
    const variance = (Math.random() - 0.5) * 20; // ±10 points
    completionScore = Math.max(0, Math.min(100, Math.round(baseScore + variance)));
    
    // More balanced recommendation logic
    if (completionScore >= 75) {
      recommendation = 'release';
    } else if (completionScore >= 60) {
      // 60-74: More likely to release with some variance
      recommendation = Math.random() > 0.3 ? 'release' : 'dispute';
    } else if (completionScore >= 40) {
      // 40-59: Mixed recommendations
      recommendation = Math.random() > 0.6 ? 'release' : 'dispute';
    } else {
      // Below 40: Dispute
      recommendation = 'dispute';
    }
    
    // Generate contextual reasoning
    let reasoning;
    if (completionScore >= 75) {
      reasoning = `High-quality delivery detected. Task requirements appear to be substantially met with ${(similarity * 100).toFixed(1)}% keyword alignment. Recommendation: Release funds.`;
    } else if (completionScore >= 60) {
      reasoning = `Moderate completion quality. Found ${commonWords.length} matching requirements with ${(similarity * 100).toFixed(1)}% alignment. Some gaps detected but core work appears complete.`;
    } else if (completionScore >= 40) {
      reasoning = `Partial completion detected. Only ${(similarity * 100).toFixed(1)}% requirement alignment found. Significant gaps or quality issues present.`;
    } else {
      reasoning = `Low completion quality. Minimal requirement alignment (${(similarity * 100).toFixed(1)}%). Major deliverables appear missing or incomplete.`;
    }
    
    const mockResult = {
      completionScore,
      recommendation,
      reasoning,
      timestamp: new Date().toISOString(),
      model: 'mock-ai-verifier-v2.0'
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
