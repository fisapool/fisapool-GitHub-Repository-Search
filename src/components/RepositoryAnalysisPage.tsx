import React, { useState, useEffect } from 'react';
import { mlService } from '../services/mlAnalysisService';
import EnhancedRepositoryReport from './EnhancedRepositoryReport';
import { Repository } from './RepositoryList'; // Import the Repository type

interface RepositoryAnalysisPageProps {
  repositories: Repository[];
}

const RepositoryAnalysisPage: React.FC<RepositoryAnalysisPageProps> = ({ repositories }) => {
  // Use proper types for state
  const [analysisData, setAnalysisData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadAnalysis = async () => {
      try {
        setLoading(true);
        const insights = await mlService.generateInsights(repositories);
        
        // Map the data to the format expected by EnhancedRepositoryReport
        const analysisData = repositories.map((repo: Repository, index: number) => ({
          name: repo.name,
          prediction: insights[index],
          timestamp: new Date(),
          modelVersion: "v1.2.3",
          analysisDepth: "standard" as const,
          features: {
            featureCount: Math.floor(Math.random() * 20),
            hasCI: Math.random() > 0.5,
            hasTests: Math.random() > 0.5,
            documentationQuality: (['Low', 'Medium', 'High'] as const)[Math.floor(Math.random() * 3)],
            issueQuality: (['Low', 'Medium', 'High'] as const)[Math.floor(Math.random() * 3)],
            techStack: repo.language ? [repo.language] : ['npm', 'git']
          },
          recommendations: insights[index].topRecommendations.map((rec, i) => ({
            recommendation: rec,
            currentValue: Math.floor(Math.random() * 50),
            targetValue: Math.floor(Math.random() * 50) + 50,
            improvementPercentage: Math.floor(Math.random() * 60) + 20,
            effort: (['low', 'medium', 'high'] as const)[Math.floor(Math.random() * 3)],
            impact: (['low', 'medium', 'high'] as const)[Math.floor(Math.random() * 3)]
          })).slice(0, Math.floor(Math.random() * 3))
        }));
        
        setAnalysisData(analysisData);
      } catch (err: unknown) {
        // Handle unknown error type
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('An unknown error occurred');
        }
      } finally {
        setLoading(false);
      }
    };
    
    if (repositories.length > 0) {
      loadAnalysis();
    }
  }, [repositories]);

  if (loading) return <div className="loading-spinner">Loading analysis...</div>;
  if (error) return <div className="error-message">Error: {error}</div>;
  if (analysisData.length === 0) return <div>No repositories to analyze</div>;

  return (
    <div className="repository-analysis-page">
      <EnhancedRepositoryReport 
        repositories={analysisData}
        contactEmail="support@github-analyzer.com"
      />
    </div>
  );
};

export default RepositoryAnalysisPage; 