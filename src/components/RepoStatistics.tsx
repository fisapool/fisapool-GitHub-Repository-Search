import React from 'react';

interface RepoStatisticsProps {
  stars: number;
  forks: number;
  issues: number;
  language: string | null;
}

const RepoStatistics: React.FC<RepoStatisticsProps> = ({ stars, forks, issues, language }) => {
  const getLanguageColor = (lang: string | null): string => {
    const colors: {[key: string]: string} = {
      "JavaScript": "#f1e05a",
      "TypeScript": "#2b7489",
      "Python": "#3572A5",
      "Java": "#b07219",
      "C#": "#178600",
      "PHP": "#4F5D95",
      "Ruby": "#701516",
      "Go": "#00ADD8",
      "C++": "#f34b7d",
      "Swift": "#ffac45"
    };
    
    return colors[lang || ""] || "#858585";
  };

  return (
    <div className="repo-statistics">
      <h3>Repository Statistics</h3>
      <div className="stats-grid">
        <div className="stat-item">
          <div className="stat-icon">⭐</div>
          <div className="stat-value">{stars.toLocaleString()}</div>
          <div className="stat-label">Stars</div>
        </div>
        <div className="stat-item">
          <div className="stat-icon">🍴</div>
          <div className="stat-value">{forks.toLocaleString()}</div>
          <div className="stat-label">Forks</div>
        </div>
        <div className="stat-item">
          <div className="stat-icon">⚠️</div>
          <div className="stat-value">{issues.toLocaleString()}</div>
          <div className="stat-label">Issues</div>
        </div>
        {language && (
          <div className="stat-item">
            <div className="language-dot" style={{ backgroundColor: getLanguageColor(language) }}></div>
            <div className="stat-value">{language}</div>
            <div className="stat-label">Language</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RepoStatistics; 