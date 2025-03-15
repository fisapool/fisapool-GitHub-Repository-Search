import React from 'react';
import { Repository } from '../../../../types/repository';
import '../../../../styles/components/repository.css';

interface RepositoryListProps {
  repositories: Repository[];
  selectedRepository: Repository | null;
  onSelectRepository: (repository: Repository) => void;
}

export const RepositoryList: React.FC<RepositoryListProps> = ({
  repositories,
  selectedRepository,
  onSelectRepository
}) => {
  if (!repositories || repositories.length === 0) {
    return (
      <div className="repository-list">
        <div className="repository-list-header">
          <h2>Repository Results</h2>
        </div>
        <div className="repository-list-empty">
          No repositories found. Try adjusting your search terms.
        </div>
      </div>
    );
  }

  return (
    <div className="repository-list">
      <div className="repository-list-header">
        <h2>Repository Results</h2>
        <span className="result-count">{repositories.length} found</span>
      </div>
      <div className="repository-list-items">
        {repositories.map(repo => (
          <div
            key={repo.id}
            className={`repository-item ${selectedRepository?.id === repo.id ? 'selected' : ''}`}
            onClick={() => onSelectRepository(repo)}
          >
            <div className="repository-item-header">
              <div className="repository-name">{repo.name}</div>
              {repo.language && (
                <div className="repository-language">{repo.language}</div>
              )}
            </div>
            
            <div className="repository-description">
              {repo.description || 'No description available'}
            </div>
            
            <div className="repository-stats">
              <div className="stat stat-stars">
                <span className="stat-value">{repo.stargazers_count.toLocaleString()}</span>
              </div>
              <div className="stat stat-forks">
                <span className="stat-value">{repo.forks_count.toLocaleString()}</span>
              </div>
              <div className="stat stat-issues">
                <span className="stat-value">{repo.open_issues_count.toLocaleString()}</span>
              </div>
            </div>
            
            <a
              href={repo.html_url}
              target="_blank"
              rel="noopener noreferrer"
              className="view-repo-link"
              onClick={(e) => e.stopPropagation()}
            >
              View on GitHub
            </a>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RepositoryList; 