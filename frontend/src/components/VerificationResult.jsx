import React from 'react';
import { CheckCircle, XCircle, Brain, Clock, AlertTriangle } from 'lucide-react';

const VerificationResult = ({ result, isLoading, error }) => {
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
        <div className="flex items-center justify-center space-x-3">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
          <span className="text-gray-600">AI is analyzing the task completion...</span>
        </div>
        <p className="text-sm text-gray-500 mt-3 text-center">
          This may take a few moments
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-md border border-red-200 p-6">
        <div className="flex items-center space-x-3 mb-4">
          <AlertTriangle className="h-6 w-6 text-red-500" />
          <h3 className="text-lg font-semibold text-red-800">Verification Failed</h3>
        </div>
        <p className="text-red-600 mb-4">{error}</p>
        <div className="bg-red-50 rounded-lg p-3">
          <p className="text-sm text-red-700">
            Please check your internet connection and try again. If the problem persists, 
            the AI verification service may be temporarily unavailable.
          </p>
        </div>
      </div>
    );
  }

  if (!result) {
    return null;
  }

  const getScoreIcon = (score) => {
    if (score >= 80) return <CheckCircle className="h-6 w-6 text-green-500" />;
    if (score >= 60) return <XCircle className="h-6 w-6 text-yellow-500" />;
    return <XCircle className="h-6 w-6 text-red-500" />;
  };

  const getRecommendationIcon = (recommendation) => {
    return recommendation === 'release' 
      ? <CheckCircle className="h-5 w-5 text-green-500" />
      : <XCircle className="h-5 w-5 text-red-500" />;
  };

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200">
      <div className="p-6">
        <div className="flex items-center space-x-3 mb-6">
          <Brain className="h-6 w-6 text-primary-600" />
          <h3 className="text-lg font-semibold text-gray-900">AI Verification Result</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Completion Score */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-gray-700">Completion Score</h4>
              {getScoreIcon(result.completionScore)}
            </div>
            <div className="text-center">
              <div className={`text-4xl font-bold mb-2 ${result.scoreColor}`}>
                {result.completionScore}
              </div>
              <div className="text-sm text-gray-600 mb-3">
                {result.scoreLabel} ({result.completionScore}/100)
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-500 ${
                    result.completionScore >= 80 ? 'bg-green-500' :
                    result.completionScore >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${result.completionScore}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Recommendation */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-gray-700">Recommendation</h4>
              {getRecommendationIcon(result.recommendation)}
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold mb-2 ${result.recommendationColor}`}>
                {result.recommendation === 'release' ? 'Release Funds' : 'Initiate Dispute'}
              </div>
              <div className="text-sm text-gray-600">
                {result.recommendation === 'release' 
                  ? 'Task completed satisfactorily'
                  : 'Task requires further review'
                }
              </div>
            </div>
          </div>
        </div>

        {/* Reasoning */}
        {result.reasoning && (
          <div className="mt-6">
            <h4 className="font-medium text-gray-700 mb-3">AI Analysis</h4>
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-sm text-gray-700 leading-relaxed">
                {result.reasoning}
              </p>
            </div>
          </div>
        )}

        {/* Technical Details */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center space-x-4">
              <span>Model: {result.model}</span>
              {result.timestamp && (
                <span className="flex items-center space-x-1">
                  <Clock className="h-3 w-3" />
                  <span>{new Date(result.timestamp).toLocaleString()}</span>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Action Recommendation */}
        <div className={`mt-4 p-3 rounded-lg ${
          result.recommendation === 'release' 
            ? 'bg-green-50 border border-green-200' 
            : 'bg-red-50 border border-red-200'
        }`}>
          <p className={`text-sm font-medium ${
            result.recommendation === 'release' ? 'text-green-800' : 'text-red-800'
          }`}>
            {result.recommendation === 'release' 
              ? '✅ Recommended Action: Release funds to freelancer'
              : '⚠️ Recommended Action: Initiate dispute resolution'
            }
          </p>
          {result.recommendation === 'dispute' && (
            <p className="text-xs text-red-600 mt-1">
              The AI detected issues that require manual review by a mediator.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default VerificationResult;
