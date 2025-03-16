import React from 'react';
import { mlAnalysisService } from '../../../../services/mlAnalysisService';
import '../../../../styles/components/analysis.css';

interface MLModelInfoProps {
  modelVersion: string;
  lastUpdated: Date;
  confidenceLevel: number;
}

export const MLModelInfo: React.FC<MLModelInfoProps> = ({
  modelVersion,
  lastUpdated,
  confidenceLevel
}) => {
  const isModelReady = mlAnalysisService.isModelReady?.() || false;
  
  return (
    <div className="ml-model-info">
      <h3>ML Model Information</h3>
      
      <div className="model-status">
        <span className="status-indicator">
          <span className={`status-dot ${isModelReady ? 'active' : 'inactive'}`}></span>
          <span>Model Status: {isModelReady ? 'Ready' : 'Loading...'}</span>
        </span>
      </div>
      
      <div className="model-details">
        <div className="detail-item">
          <span className="detail-label">Version:</span>
          <span className="detail-value">{modelVersion}</span>
        </div>
        
        <div className="detail-item">
          <span className="detail-label">Last Updated:</span>
          <span className="detail-value">
            {lastUpdated.toLocaleDateString()}
          </span>
        </div>
        
        <div className="detail-item">
          <span className="detail-label">Confidence Level:</span>
          <span className="detail-value">
            {confidenceLevel}%
          </span>
        </div>
      </div>
      
      <div className="model-explanation">
        <h4>About the Model</h4>
        <p>
          This model analyzes repository metrics to identify patterns and make recommendations 
          for improving code quality, documentation, and development practices.
        </p>
        <p>
          <strong>Data Sources:</strong> GitHub API, Open Source Repository Metrics, Code Quality Benchmarks
        </p>
      </div>
      
      <div className="model-accuracy">
        <h4>Accuracy Information</h4>
        <p>
          Model predictions are most accurate for repositories with:
        </p>
        <ul>
          <li>Active development in the last 6 months</li>
          <li>At least 10 contributors</li>
          <li>More than 100 commits</li>
        </ul>
        <p className="accuracy-note">
          All predictions should be validated by human review.
        </p>
      </div>
    </div>
  );
};

export default MLModelInfo; 