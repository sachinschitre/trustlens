# TrustLens AI Verification Service

A lightweight Node.js/Express microservice that provides AI-powered task verification for the TrustLens escrow platform. This service compares task descriptions with delivery summaries and provides completion scores and recommendations.

## Features

- 🤖 **AI-Powered Verification**: Uses OpenAI API to analyze task completion
- 📊 **Scoring System**: Returns completion scores from 0-100
- 🎯 **Smart Recommendations**: Provides "release" or "dispute" recommendations
- 🔧 **Modular Design**: Easy to swap AI providers
- 🛡️ **Security**: Rate limiting, CORS, helmet security
- 📝 **Comprehensive Logging**: Winston-based logging with multiple levels
- 🐳 **Docker Ready**: Containerized deployment with health checks
- ⚡ **High Performance**: Optimized for low latency responses

## Quick Start

### Prerequisites

- Node.js 18+
- OpenAI API key

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd ai-verification-service

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit .env with your OpenAI API key
OPENAI_API_KEY=your_openai_api_key_here
```

### Running the Service

```bash
# Development mode
npm run dev

# Production mode
npm start

# Using Docker
docker-compose up
```

The service will be available at `http://localhost:3001`

## API Documentation

### Base URL
```
http://localhost:3001/api
```

### Endpoints

#### POST `/api/verification/verify`

Verify a single task completion.

**Request Body:**
```json
{
  "taskDescription": "Create a responsive website with contact form",
  "deliverySummary": "Built a mobile-responsive website using React with a working contact form that validates email addresses and sends notifications."
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "completionScore": 85,
    "recommendation": "release",
    "reasoning": "Website delivered with responsive design and functional contact form. Minor enhancement opportunities exist.",
    "timestamp": "2024-01-15T10:30:00.000Z",
    "model": "gpt-3.5-turbo"
  }
}
```

#### POST `/api/verification/batch`

Verify multiple tasks in batch (up to 10).

**Request Body:**
```json
{
  "tasks": [
    {
      "taskId": "task_1",
      "taskDescription": "Create a logo design",
      "deliverySummary": "Delivered 3 logo variations in PNG and SVG formats"
    },
    {
      "taskId": "task_2", 
      "taskDescription": "Write marketing copy",
      "deliverySummary": "Created compelling marketing copy for homepage and product pages"
    }
  ]
}
```

#### GET `/api/health`

Basic health check.

#### GET `/api/health/detailed`

Detailed health check including AI service status.

## Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | 3001 |
| `NODE_ENV` | Environment | development |
| `LOG_LEVEL` | Logging level | info |
| `OPENAI_API_KEY` | OpenAI API key | Required |
| `OPENAI_MODEL` | AI model to use | gpt-3.5-turbo |
| `ALLOWED_ORIGINS` | CORS allowed origins | http://localhost:3000 |

### AI Models

The service supports multiple OpenAI models:

- `gpt-3.5-turbo` (default, fastest, cost-effective)
- `gpt-4` (more accurate, slower, expensive)
- `gpt-4-turbo-preview` (balanced performance)

## Scoring System

The AI evaluates tasks based on:

- **Completeness**: How well the delivery matches requirements
- **Quality**: Overall quality of the work delivered
- **Accuracy**: Precision in meeting specifications

### Score Ranges

| Score | Description | Recommendation |
|-------|-------------|----------------|
| 90-100 | Excellent completion | Release |
| 80-89 | Good completion | Release |
| 70-79 | Satisfactory completion | Release |
| 60-69 | Partial completion | Dispute |
| 0-59 | Poor completion | Dispute |

## Error Handling

The service includes comprehensive error handling:

- **Validation Errors**: 400 Bad Request
- **Rate Limiting**: 429 Too Many Requests
- **AI Service Errors**: 503 Service Unavailable
- **Internal Errors**: 500 Internal Server Error

## Logging

Logs are written using Winston with different levels:

- `error`: Critical errors
- `warn`: Warning messages
- `info`: General information
- `http`: HTTP requests
- `debug`: Debug information

## Deployment

### Docker Deployment

```bash
# Build and run with Docker Compose
docker-compose up -d

# View logs
docker-compose logs -f
```

### Production Considerations

1. **Environment Variables**: Set all required environment variables
2. **SSL/TLS**: Use HTTPS in production
3. **Load Balancing**: Consider multiple instances for high availability
4. **Monitoring**: Set up monitoring and alerting
5. **Backup**: Regular backup of logs and configuration

## Integration with TrustLens

This service integrates with the TrustLens escrow platform:

1. **Frontend**: React app calls this service for task verification
2. **Smart Contract**: Verification results can trigger contract actions
3. **Workflow**: Seamless integration with dispute resolution

## Development

### Running Tests

```bash
npm test
```

### Code Quality

```bash
# Lint code
npm run lint

# Format code
npm run format
```

### Adding New AI Providers

The service is designed to be modular. To add a new AI provider:

1. Create a new service class in `src/services/`
2. Implement the same interface as `AIVerificationService`
3. Update the service factory to support multiple providers
4. Add configuration for the new provider

## License

MIT License - Built for the TrustLens ecosystem
