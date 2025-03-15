import React, { useState } from 'react';
import { Repository } from '../../../../types/repository';
import { mlService } from '../../../../services/mlAnalysisService';
import '../../../../styles/components/repository.css';

interface RepositoryComparisonProps {
  repositories: Repository[];
}

export const RepositoryComparison: React.FC<RepositoryComparisonProps> = ({ 
  repositories 
}) => {
  // Add your component implementation here
  return (
    <div className="repository-comparison">
      <h2>Repository Comparison</h2>
      {repositories.map(repo => (
        <div key={repo.id} className="comparison-item">
          {repo.name}
        </div>
      ))}
    </div>
  );
};

export default RepositoryComparison; 