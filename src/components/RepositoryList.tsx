import React from 'react';

export interface Repository {
  id: number;
  name: string;
  full_name: string;
  description: string;
  html_url: string;
  stargazers_count: number;
  forks_count: number;
  open_issues_count: number;
  language: string | null;
  created_at: string;
  updated_at: string;
  license: {
    name: string;
  } | null;
  owner: {
    login: string;
    avatar_url: string;
    html_url: string;
  };
}

export interface RepositoryListProps {
  repositories: Repository[];
  onSelect: (repo: Repository) => void;
}

const RepositoryList: React.FC<RepositoryListProps> = ({ repositories, onSelect }) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <div className="repository-list">
      <h2>Repositories</h2>
      {repositories.length === 0 ? (
        <p className="no-results">No repositories found. Try a different search query.</p>
      ) : (
        <ul>
          {repositories.map((repo) => (
            <li key={repo.id} onClick={() => onSelect(repo)} className="repo-item">
              <div className="repo-header">
                <h3 className="repo-name">{repo.name}</h3>
                {repo.language && <span className="repo-language">{repo.language}</span>}
              </div>
              
              <p className="repo-description">
                {repo.description || "No description provided"}
              </p>
              
              <div className="repo-owner">
                <img 
                  src={repo.owner.avatar_url} 
                  alt={`${repo.owner.login}'s avatar`} 
                  className="owner-avatar"
                />
                <span>{repo.owner.login}</span>
              </div>
              
              <div className="repo-meta">
                <span className="repo-stars">⭐ {repo.stargazers_count.toLocaleString()}</span>
                <span className="repo-forks">🍴 {repo.forks_count.toLocaleString()}</span>
                <span className="repo-issues">⚠️ {repo.open_issues_count.toLocaleString()}</span>
              </div>
              
              <div className="repo-dates">
                <span>Created: {formatDate(repo.created_at)}</span>
                <span>Updated: {formatDate(repo.updated_at)}</span>
              </div>
              
              {repo.license && (
                <div className="repo-license">
                  <span>📜 {repo.license.name}</span>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default RepositoryList; 