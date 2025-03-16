import React from 'react';
import { Repository } from '../types/repository';

interface RepositoryDetailsProps {
  repository: Repository;
}

const RepositoryDetails: React.FC<RepositoryDetailsProps> = ({
  repository
}) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="repository-details">
      <div className="repository-header">
        <div className="repository-title">
          <h2>{repository.name}</h2>
          <span className="repository-fullname">{repository.full_name}</span>
        </div>
        
        <div className="repository-stats">
          <div className="stat-item">
            <span className="stat-icon">⭐</span>
            <span className="stat-value">{repository.stargazers_count}</span>
            <span className="stat-label">Stars</span>
          </div>
          
          <div className="stat-item">
            <span className="stat-icon">🍴</span>
            <span className="stat-value">{repository.forks_count}</span>
            <span className="stat-label">Forks</span>
          </div>
          
          <div className="stat-item">
            <span className="stat-icon">👁️</span>
            <span className="stat-value">{repository.watchers_count}</span>
            <span className="stat-label">Watchers</span>
          </div>
          
          <div className="stat-item">
            <span className="stat-icon">⚠️</span>
            <span className="stat-value">{repository.open_issues_count}</span>
            <span className="stat-label">Issues</span>
          </div>
        </div>
      </div>
      
      <div className="repository-description">
        {repository.description ? (
          <p>{repository.description}</p>
        ) : (
          <p className="no-description">No description provided</p>
        )}
      </div>
      
      <div className="repository-meta">
        <div className="meta-item">
          <span className="meta-label">Primary Language:</span>
          <span className="meta-value">{repository.language || 'Not specified'}</span>
        </div>
        
        <div className="meta-item">
          <span className="meta-label">Created:</span>
          <span className="meta-value">{formatDate(repository.created_at)}</span>
        </div>
        
        <div className="meta-item">
          <span className="meta-label">Last Updated:</span>
          <span className="meta-value">{formatDate(repository.updated_at)}</span>
        </div>
        
        <div className="meta-item">
          <span className="meta-label">Default Branch:</span>
          <span className="meta-value">{repository.default_branch}</span>
        </div>
      </div>
      
      <div className="repository-links">
        <a 
          href={repository.html_url} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="repo-link primary-link"
        >
          View on GitHub
        </a>
        
        {repository.homepage && (
          <a 
            href={repository.homepage} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="repo-link homepage-link"
          >
            Project Homepage
          </a>
        )}
      </div>
      
      {repository.topics && repository.topics.length > 0 && (
        <div className="repository-topics">
          <h3>Topics</h3>
          <div className="topics-list">
            {repository.topics.map((topic, index) => (
              <span key={index} className="topic-tag">
                {topic}
              </span>
            ))}
          </div>
        </div>
      )}
      
      {repository.license && (
        <div className="repository-license">
          <h3>License</h3>
          <p>{repository.license.name}</p>
        </div>
      )}
    </div>
  );
};

export default RepositoryDetails; 