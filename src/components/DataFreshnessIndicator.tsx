import React from 'react';

interface DataFreshnessIndicatorProps {
  lastUpdated: Date;
  dataSource: string;
}

const DataFreshnessIndicator: React.FC<DataFreshnessIndicatorProps> = ({
  lastUpdated,
  dataSource
}) => {
  // Calculate how fresh the data is
  const now = new Date();
  const diffMs = now.getTime() - lastUpdated.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  
  // Determine freshness level
  let freshness: 'fresh' | 'recent' | 'stale' = 'fresh';
  let freshnessText = 'Just now';
  
  if (diffMins > 5 && diffMins <= 60) {
    freshnessText = `${diffMins} minutes ago`;
    freshness = 'fresh';
  } else if (diffHours > 1 && diffHours <= 24) {
    freshnessText = `${diffHours} hours ago`;
    freshness = 'recent';
  } else if (diffDays >= 1) {
    freshnessText = `${diffDays} days ago`;
    freshness = diffDays > 7 ? 'stale' : 'recent';
  }
  
  return (
    <div className="data-freshness-indicator">
      <div className={`freshness-badge ${freshness}`}>
        <span className="freshness-dot"></span>
        <span className="freshness-text">{freshnessText}</span>
      </div>
      <div className="data-source">
        Source: {dataSource}
      </div>
    </div>
  );
};

export default DataFreshnessIndicator; 