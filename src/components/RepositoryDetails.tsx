import React, { useState } from 'react';
import { Repository } from './RepositoryList';
import DetailedActionPlan from './DetailedActionPlan';
import { mlService } from '../services/mlAnalysisService';

interface RepositoryDetailsProps extends Repository {
  onError?: (error: { type: string; message: string; details: string }) => void;
}

const RepositoryDetails: React.FC<RepositoryDetailsProps> = (props) => {
  const [actionPlan, setActionPlan] = useState<any>(null);
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);
  const { onError } = props;

  const handleGenerateActionPlan = async () => {
    setIsGeneratingPlan(true);
    try {
      const plan = await mlService.generateDetailedActionPlan(props);
      setActionPlan(plan);
    } catch (error) {
      console.error('Error generating action plan:', error);
      // Show error notification
      if (onError) {
        onError({
          type: 'model',
          message: 'Failed to generate action plan',
          details: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    } finally {
      setIsGeneratingPlan(false);
    }
  };

  return (
    <div className="repository-details">
      <h2>{props.name}</h2>
      <p>{props.description}</p>
      <div className="repository-stats">
        <div>
          <strong>Owner:</strong> {props.owner.login}
          <img src={props.owner.avatar_url} alt={`${props.owner.login}'s avatar`} width="50" />
        </div>
        <div>
          <strong>Stars:</strong> {props.stargazers_count}
        </div>
        <div>
          <strong>Forks:</strong> {props.forks_count}
        </div>
      </div>
      <a href={props.html_url} target="_blank" rel="noopener noreferrer">
        View on GitHub
      </a>
      <button 
        className="action-button"
        onClick={handleGenerateActionPlan}
        disabled={isGeneratingPlan}
      >
        {isGeneratingPlan ? 'Generating Plan...' : 'Generate Detailed Action Plan'}
      </button>
      {actionPlan && (
        <div className="repository-action-plan">
          <DetailedActionPlan 
            actionPlan={actionPlan}
            repositoryName={props.name}
          />
        </div>
      )}
    </div>
  );
};

export default RepositoryDetails; 