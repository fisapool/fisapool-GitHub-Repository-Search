import React from 'react';
import { Repository } from '../../../../types/repository';
import '../../../../styles/components/repository.css';

interface RepositoryListProps {
  repositories: Repository[];
  onSelectRepository: (repository: Repository) => void;
  selectedRepository?: Repository | null;
}

export const RepositoryList: React.FC<RepositoryListProps> = ({
  repositories,
  onSelectRepository,
  selectedRepository
}) => {
  return (
    <div className="repository-list">
      <div className="repository-list-header">
        <h2>Repositories ({repositories.length})</h2>
      </div>
      
      {repositories.length === 0 ? (
        <div className="repository-list-empty">
          <p>No repositories found. Try a different search term.</p>
        </div>
      ) : (
        <div className="repository-items">
          {repositories.map(repo => (
            <div 
              key={repo.id}
              className={`repository-item ${selectedRepository?.id === repo.id ? 'selected' : ''}`}
              onClick={() => onSelectRepository(repo)}
            >
              <div className="repository-header">
                <h3 className="repository-name">{repo.name}</h3>
                <div className="repository-stats">
                  <span className="repository-stat">
                    <i className="icon-star"></i>
                    {repo.stargazers_count.toLocaleString()}
                  </span>
                  <span className="repository-stat">
                    <i className="icon-fork"></i>
                    {repo.forks_count.toLocaleString()}
                  </span>
                </div>
              </div>
              
              {repo.description && (
                <p className="repository-description">{repo.description}</p>
              )}
              
              <div className="repository-meta">
                {repo.language && (
                  <span className="repo-language">{repo.language}</span>
                )}
                <span className="repo-owner">
                  by {repo.owner.login}
                </span>
                <span className="repo-updated">
                  Updated {new Date(repo.updated_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RepositoryList; 