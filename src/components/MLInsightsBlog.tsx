import React from 'react';
import { Repository } from '../types/repository';
import { MLPrediction } from '../services/mlAnalysisService';

interface MLInsightsBlogProps {
  repository: Repository;
  prediction: MLPrediction;
}

const MLInsightsBlog: React.FC<MLInsightsBlogProps> = ({
  repository,
  prediction
}) => {
  return (
    <div className="ml-insights-blog">
      <div className="insights-header">
        <h2>AI Analysis for {repository.full_name}</h2>
        <div className="meta-info">
          <span className="confidence-badge">
            Confidence: {prediction.confidenceLevel}%
          </span>
        </div>
      </div>
      
      <div className="insights-score">
        <div className="score-circle">
          <span className="score-value">{prediction.predictedScore}</span>
          <span className="score-label">SCORE</span>
        </div>
        <p className="score-explanation">
          This score represents the overall quality assessment based on multiple factors including code organization, documentation, and community engagement.
        </p>
      </div>
      
      <div className="insights-summary">
        <h3>Summary</h3>
        <p>{prediction.insightSummary}</p>
      </div>
      
      <div className="recommendations">
        <h3>Recommended Improvements</h3>
        <ul className="recommendation-list">
          {prediction.topRecommendations.map((recommendation, index) => (
            <li key={index} className="recommendation-item">
              <div className="recommendation-icon">💡</div>
              <div className="recommendation-text">{recommendation}</div>
            </li>
          ))}
        </ul>
      </div>
      
      <div className="similar-repositories">
        <h3>Similar Repositories</h3>
        <ul className="similar-repo-list">
          {prediction.similarRepositories.map((repoName, index) => (
            <li key={index} className="similar-repo-item">
              <a href={`https://github.com/${repoName}`} target="_blank" rel="noopener noreferrer">
                {repoName}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default MLInsightsBlog; 