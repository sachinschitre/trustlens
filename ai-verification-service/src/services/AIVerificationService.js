const OpenAI = require('openai');
const logger = require('../utils/logger');

class AIVerificationService {
  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    this.model = process.env.OPENAI_MODEL || 'gpt-3.5-turbo';
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
        deliveryLength: deliverySummary.length
      });

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
