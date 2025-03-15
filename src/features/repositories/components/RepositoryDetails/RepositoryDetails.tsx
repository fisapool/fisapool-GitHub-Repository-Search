import React, { useState } from 'react';
import { Repository } from '../../../../types/repository';
import { mlService } from '../../../../services/mlAnalysisService';
import '../../../../styles/components/repository.css';

interface RepositoryDetailsProps {
  repository: Repository;
  onAnalyzeClick?: () => void;
}

export const RepositoryDetails: React.FC<RepositoryDetailsProps> = ({
  repository,
  onAnalyzeClick
}) => {
  const [showActions, setShowActions] = useState(false);
  
  return (
    <div className="repository-details">
      <div className="repository-header">
        <div className="repository-title">
          <h2>{repository.name}</h2>
          {repository.owner && (
            <div className="repository-owner">
              <img 
                src={repository.owner.avatar_url} 
                alt={`${repository.owner.login}'s avatar`}
                className="owner-avatar"
              />
              <a 
                href={repository.owner.html_url}
                target="_blank"
                rel="noopener noreferrer"
                className="owner-name"
              >
                {repository.owner.login}
              </a>
            </div>
          )}
        </div>
        
        <div className="repository-actions">
          <a 
            href={repository.html_url} 
            target="_blank"
            rel="noopener noreferrer"
            className="secondary-button"
          >
            View on GitHub
          </a>
          
          <button
            className="primary-button"
            onClick={() => setShowActions(!showActions)}
          >
            {showActions ? 'Hide Actions' : 'Show Actions'}
          </button>
        </div>
      </div>
      
      {repository.description && (
        <p className="repository-description">{repository.description}</p>
      )}
      
      <div className="repository-stats">
        <div className="stat-group">
          <div className="stat">
            <span className="stat-value">{repository.stargazers_count.toLocaleString()}</span>
            <span className="stat-label">Stars</span>
          </div>
          
          <div className="stat">
            <span className="stat-value">{repository.forks_count.toLocaleString()}</span>
            <span className="stat-label">Forks</span>
          </div>
          
          <div className="stat">
            <span className="stat-value">{repository.open_issues_count.toLocaleString()}</span>
            <span className="stat-label">Issues</span>
          </div>
        </div>
        
        <div className="stat-group">
          <div className="stat">
            <span className="stat-label">Primary Language</span>
            <span className="stat-value">{repository.language || 'Not specified'}</span>
          </div>
          
          <div className="stat">
            <span className="stat-label">Last Updated</span>
            <span className="stat-value">
              {new Date(repository.updated_at).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>
      
      {showActions && (
        <div className="repository-action-panel">
          <h3>Repository Actions</h3>
          
          <div className="action-buttons">
            <button 
              className="action-button analyze"
              onClick={onAnalyzeClick}
            >
              Generate ML Analysis Report
            </button>
            
            <button className="action-button download">
              Download Repository Data
            </button>
            
            <button className="action-button share">
              Share Repository
            </button>
          </div>
        </div>
      )}
      
      {repository.topics && repository.topics.length > 0 && (
        <div className="repository-topics">
          <h4>Topics</h4>
          <div className="topics-list">
            {repository.topics.map(topic => (
              <span key={topic} className="topic-tag">
                {topic}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default RepositoryDetails; 