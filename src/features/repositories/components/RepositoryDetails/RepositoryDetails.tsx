import React from 'react';
import { Repository } from '../../../../types/repository';
import '../../../../styles/components/repository.css';
import { formatDate, formatNumber } from '../../../../utils/formatters';

interface RepositoryDetailsProps {
  repository: Repository;
  onShowReport?: () => void;
}

const RepositoryDetails: React.FC<RepositoryDetailsProps> = ({ 
  repository,
  onShowReport
}) => {
  // Calculate repository age in days
  const calculateRepositoryAge = (createdAt: string) => {
    const created = new Date(createdAt);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - created.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  // Calculate activity score based on last update date
  const calculateActivityScore = (updatedAt: string) => {
    const lastUpdated = new Date(updatedAt);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - lastUpdated.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 7) return { status: 'Very Active', color: '#28a745', score: 95 };
    if (diffDays <= 30) return { status: 'Active', color: '#2ea44f', score: 80 };
    if (diffDays <= 90) return { status: 'Moderately Active', color: '#34d058', score: 65 };
    if (diffDays <= 180) return { status: 'Less Active', color: '#f1e05a', score: 40 };
    return { status: 'Inactive', color: '#e34c26', score: 20 };
  };

  // Calculate popularity score based on stars and forks
  const calculatePopularityScore = (stars: number, forks: number) => {
    // Weight: 70% stars, 30% forks
    const normalizedStars = Math.min(stars / 10000, 1) * 70;
    const normalizedForks = Math.min(forks / 3000, 1) * 30;
    return Math.round(normalizedStars + normalizedForks);
  };

  // Calculate maintenance score based on multiple factors
  const calculateMaintenanceScore = (
    updatedAt: string,
    stars: number,
    forks: number,
    openIssues: number,
    createdAt: string
  ) => {
    const activityScore = calculateActivityScore(updatedAt).score;
    const age = calculateRepositoryAge(createdAt);
    
    // Normalize issues count based on project size (stars + forks)
    const projectSize = stars + forks;
    const normalizedIssues = Math.min(1, (projectSize > 0 ? (openIssues / projectSize) * 100 : 0));
    const issueScore = 100 - normalizedIssues * 50; // Lower is better for issue ratio
    
    // Age factor - newer projects might have fewer issues resolved
    const ageFactor = Math.min(1, age / 365) * 15;
    
    // Activity weight: 45%, Issue handling: 40%, Age: 15%
    const score = Math.round((activityScore * 0.45) + (issueScore * 0.4) + ageFactor);
    
    return {
      score,
      color: score >= 80 ? '#28a745' : score >= 60 ? '#2ea44f' : score >= 40 ? '#f1e05a' : '#e34c26'
    };
  };

  // Determine repository nature based on fork-to-star ratio
  const determineRepositoryNature = (forks: number, stars: number) => {
    const ratio = forks / (stars || 1);
    
    if (ratio >= 0.5) return { nature: 'Highly Collaborative', color: '#1f6feb' };
    if (ratio >= 0.3) return { nature: 'Collaborative', color: '#0366d6' };
    if (ratio >= 0.15) return { nature: 'Balanced', color: '#2188ff' };
    if (ratio >= 0.05) return { nature: 'Reference', color: '#58a6ff' };
    return { nature: 'Tutorial/Template', color: '#79c0ff' };
  };

  // Calculate stats
  const activityStatus = calculateActivityScore(repository.updated_at);
  const popularityScore = calculatePopularityScore(repository.stargazers_count, repository.forks_count);
  const maintenanceScore = calculateMaintenanceScore(
    repository.updated_at,
    repository.stargazers_count,
    repository.forks_count,
    repository.open_issues_count,
    repository.created_at
  );
  const forkToStarRatio = repository.stargazers_count > 0 
    ? (repository.forks_count / repository.stargazers_count).toFixed(2) 
    : '0.00';
  const repositoryNature = determineRepositoryNature(repository.forks_count, repository.stargazers_count);
  const repositoryAge = calculateRepositoryAge(repository.created_at);

  return (
    <div className="repository-details">
      <div className="details-header">
        <h2>{repository.name}</h2>
        <p className="repository-description">{repository.description}</p>
        <div className="repository-meta">
          <span className="owner">
            <i className="fas fa-user"></i> {repository.owner.login}
          </span>
          <span className="language">
            <i className="fas fa-code"></i> {repository.language || 'Not specified'}
          </span>
          <span className="created">
            <i className="fas fa-calendar"></i> Created: {formatDate(repository.created_at)}
          </span>
          <span className="updated">
            <i className="fas fa-clock"></i> Updated: {formatDate(repository.updated_at)}
          </span>
        </div>
      </div>
      
      <div className="details-stats">
        <div className="stat-item">
          <i className="far fa-star"></i>
          <span className="stat-count">{formatNumber(repository.stargazers_count)}</span>
          <span className="stat-label">Stars</span>
        </div>
        <div className="stat-item">
          <i className="fas fa-code-branch"></i>
          <span className="stat-count">{formatNumber(repository.forks_count)}</span>
          <span className="stat-label">Forks</span>
        </div>
        <div className="stat-item">
          <i className="fas fa-exclamation-circle"></i>
          <span className="stat-count">{formatNumber(repository.open_issues_count)}</span>
          <span className="stat-label">Issues</span>
        </div>
        <div className="stat-item">
          <i className="fas fa-eye"></i>
          <span className="stat-count">{formatNumber(repository.watchers_count)}</span>
          <span className="stat-label">Watchers</span>
        </div>
      </div>

      <div className="repository-health-dashboard">
        <h3>Repository Health Dashboard</h3>
        <div className="health-metrics">
          <div className="health-metric">
            <h4>Maintenance Score</h4>
            <div className="health-meter">
              <div className="meter-bar">
                <div 
                  className="meter-fill" 
                  style={{ width: `${maintenanceScore.score}%`, backgroundColor: maintenanceScore.color }}
                ></div>
              </div>
              <span className="meter-value">{maintenanceScore.score}</span>
            </div>
            <p className="metric-explanation">
              Measures how well maintained the repository is, based on activity, issue handling, and project maturity.
            </p>
          </div>

          <div className="health-metric">
            <h4>Repository Nature</h4>
            <div className="nature-badge" style={{ backgroundColor: repositoryNature.color }}>
              {repositoryNature.nature}
            </div>
            <p className="metric-explanation">
              Classification based on fork-to-star ratio ({forkToStarRatio}), indicating how the community interacts with this repository.
            </p>
          </div>
        </div>

        <div className="insights-summary">
          <h4>Repository Analysis</h4>
          <p>
            {repository.name} is a {repositoryAge > 365 ? 'mature' : 'relatively new'} repository 
            ({Math.floor(repositoryAge / 365)} years, {repositoryAge % 365} days old) 
            with {repository.stargazers_count} stars and {repository.forks_count} forks.
            
            {repository.license ? `\n\nThis repository is licensed under ${repository.license.name}, making it ${repository.license.spdx_id === 'MIT' ? 'very permissive and business-friendly' : 'available for use under specific terms'}.` : '\n\nThis repository does not have a clearly specified license.'}
            
            {maintenanceScore.score >= 80 ? 
              `\n\nWith a high maintenance score of ${maintenanceScore.score}, this project shows excellent upkeep and responsiveness from maintainers.` :
              maintenanceScore.score >= 60 ?
              `\n\nWith a good maintenance score of ${maintenanceScore.score}, this project appears to be adequately maintained.` :
              maintenanceScore.score >= 40 ?
              `\n\nWith a moderate maintenance score of ${maintenanceScore.score}, this project may have occasional periods of inactivity.` :
              `\n\nWith a low maintenance score of ${maintenanceScore.score}, this project shows signs of neglect or abandonment.`
            }
            
            {repositoryNature.nature === 'Highly Collaborative' ? 
              `\n\nAs a highly collaborative project, it has significant community contributions and extensive forking activity.` :
              repositoryNature.nature === 'Collaborative' ?
              `\n\nAs a collaborative project, it shows good balance between reference usage and active development by contributors.` :
              repositoryNature.nature === 'Balanced' ?
              `\n\nAs a balanced project, it serves both as reference and as a basis for derivative work.` :
              repositoryNature.nature === 'Reference' ?
              `\n\nAs a reference project, it's primarily used as a learning resource or dependency rather than for direct contributions.` :
              `\n\nAs a tutorial/template project, it's mainly used as a starting point for new projects rather than receiving direct contributions.`
            }
          </p>
        </div>
      </div>

      <div className="github-insights">
        <h3>GitHub Insights</h3>
        <div className="insights-metrics">
          <div className="metric">
            <h4>Popularity Score</h4>
            <div className="score-display">
              <div className="score-bar">
                <div 
                  className="score-fill" 
                  style={{ 
                    width: `${popularityScore}%`, 
                    backgroundColor: popularityScore > 75 ? '#28a745' : popularityScore > 50 ? '#2ea44f' : popularityScore > 25 ? '#f1e05a' : '#e34c26' 
                  }}
                ></div>
              </div>
              <span className="score-value">{popularityScore}</span>
            </div>
            <p className="metric-explanation">
              Based on stars (70%) and forks (30%), normalized against typical popular repositories
            </p>
          </div>

          <div className="metric">
            <h4>Activity Status</h4>
            <div className="activity-status">
              <span className={`status-badge status-${activityStatus.status.toLowerCase().replace(' ', '-')}`}>
                {activityStatus.status}
              </span>
            </div>
            <p className="metric-explanation">
              Based on most recent update ({formatDate(repository.updated_at)})
            </p>
          </div>

          <div className="metric">
            <h4>Stars to Forks Ratio</h4>
            <div className="ratio-display">
              <span className="ratio-value">1:{(1 / (parseFloat(forkToStarRatio) || 1)).toFixed(2)}</span>
            </div>
            <p className="metric-explanation">
              Higher ratio indicates more reference usage vs. active development
            </p>
          </div>

          <div className="metric">
            <h4>Issue Density</h4>
            <div className="ratio-display">
              <span className="ratio-value">
                {(repository.open_issues_count / (repository.stargazers_count || 1) * 100).toFixed(2)}%
              </span>
            </div>
            <p className="metric-explanation">
              Open issues relative to project popularity. Lower is typically better.
            </p>
          </div>
        </div>
      </div>

      {repository.topics && repository.topics.length > 0 && (
        <div className="repository-topics">
          <h3>Topics</h3>
          <div className="topics-list">
            {repository.topics.map((topic: string) => (
              <span key={topic} className="topic-tag">{topic}</span>
            ))}
          </div>
        </div>
      )}

      <div className="repository-actions">
        <a 
          href={repository.html_url} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="action-button primary"
        >
          <i className="fab fa-github"></i> View on GitHub
        </a>
        <a 
          href={`${repository.html_url}/issues`} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="action-button secondary"
        >
          <i className="fas fa-exclamation-circle"></i> View Issues
        </a>
        <a 
          href={`${repository.html_url}/network`} 
          target="_blank" 
          rel="noopener noreferrer"
          className="action-button secondary"
        >
          <i className="fas fa-project-diagram"></i> View Network
        </a>
      </div>
    </div>
  );
};

export default RepositoryDetails; 