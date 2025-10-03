#!/bin/bash

# TrustLens AI Verification Service Startup Script

echo "🚀 Starting TrustLens AI Verification Service..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18+ is required. Current version: $(node -v)"
    exit 1
fi

# Check if .env file exists
if [ ! -f .env ]; then
    echo "⚠️  .env file not found. Creating from .env.example..."
    cp .env.example .env
    echo "📝 Please edit .env file with your OpenAI API key and other configurations."
fi

# Check if OpenAI API key is set
if ! grep -q "OPENAI_API_KEY=sk-" .env 2>/dev/null; then
    echo "⚠️  OpenAI API key not found in .env file."
    echo "📝 Please add your OpenAI API key to the .env file."
    echo "   OPENAI_API_KEY=sk-your-api-key-here"
fi

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Create logs directory if it doesn't exist
mkdir -p logs

echo "✅ Environment checks passed"
echo "🌐 Starting server on port ${PORT:-3001}..."

# Start the application
if [ "$NODE_ENV" = "production" ]; then
    echo "🏭 Running in production mode..."
    npm start
else
    echo "🔧 Running in development mode..."
    npm run dev
fi
