import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { GitHubService } from '../services/GitHubService';
import { mlAnalysisService, MLPrediction } from '../services/mlAnalysisService';
import { Repository } from '../types/repository';
import RepositoryDetails from './RepositoryDetails';
import MLAnalysisLoader from './MLAnalysisLoader';
import MLErrorNotification from './MLErrorNotification';
import MLInsightsBlog from './MLInsightsBlog';
import DetailedActionPlan from './DetailedActionPlan';
import EnhancedRepositoryReport from './EnhancedRepositoryReport';
import { EnhancedAnalysisData } from '../services/mlAnalysisService';
import MLServiceTest from './MLServiceTest';

// Create a GitHub service instance
const githubService = new GitHubService();

// Define the ActionPlan interface for better type safety
interface ActionPlan {
  priorityTasks: Array<{
    task: string;
    impact: string;
    effort: string;
    timeEstimate: string;
  }>;
  mediumTermTasks: Array<{
    task: string;
    impact: string;
    timeEstimate: string;
  }>;
  longTermTasks: Array<{
    task: string;
    impact: string;
  }>;
  summary: string;
}

// Define interfaces for component props to fix type errors
interface MLAnalysisLoaderProps {
  repositories: Repository[];
  onAnalysisComplete: (predictions: MLPrediction[]) => void;
  onAnalysisError: (error: string) => void;
}

interface MLErrorNotificationProps {
  message: string;
}

interface MLInsightsBlogProps {
  repository: Repository;
  prediction: MLPrediction;
}

interface DetailedActionPlanProps {
  plan: any;
  repositoryName: string;
}

interface RepositoryDetailsProps {
  repository: Repository;
}

interface ActionPlanProps {
  plan: any;
  repositoryName: string;
}

const RepositoryAnalysisPage: React.FC = () => {
  // Use proper types for state
  const [analysisData, setAnalysisData] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [repository, setRepository] = useState<Repository | null>(null);
  const [mlPrediction, setMlPrediction] = useState<MLPrediction | null>(null);
  const [mlLoading, setMlLoading] = useState<boolean>(false);
  const [mlError, setMlError] = useState<string | null>(null);
  const [actionPlan, setActionPlan] = useState<ActionPlan | null>(null);
  const [viewMode, setViewMode] = useState<'details' | 'insights' | 'plan' | 'enhancedReport'>('details');
  const [enhancedReport, setEnhancedReport] = useState<EnhancedAnalysisData | null>(null);
  const [enhancedReportLoading, setEnhancedReportLoading] = useState<boolean>(false);
  const [enhancedReportError, setEnhancedReportError] = useState<string | null>(null);
  
  const { owner, repo } = useParams<{ owner: string; repo: string }>();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (!owner || !repo) {
      setError('Repository information is missing');
      setLoading(false);
      return;
    }
    
    const fetchRepositoryDetails = async () => {
      try {
        const repoDetails = await githubService.getRepository(owner, repo);
        setRepository(repoDetails);
        setLoading(false);
      } catch (err) {
        setError('Failed to load repository details. Please try again later.');
        setLoading(false);
      }
    };
    
    fetchRepositoryDetails();
  }, [owner, repo]);
  
  const handleAnalyzeRepository = async () => {
    if (!repository) return;
    
    setMlLoading(true);
    setMlError(null);
    
    try {
      // Clear the cache before analysis to ensure fresh results
      mlAnalysisService.clearCache();
      
      // Call ML analysis service
      const analysisResult = await mlAnalysisService.analyze([repository]);
      setMlPrediction(analysisResult[0]);
      setMlLoading(false);
    } catch (err) {
      setMlError('Failed to analyze repository. Please try again later.');
      setMlLoading(false);
    }
  };
  
  const handleGenerateActionPlan = async () => {
    if (!repository) return;
    
    try {
      // Clear the cache before generating the action plan
      mlAnalysisService.clearCache();
      
      const plan = await mlAnalysisService.generateDetailedActionPlan(repository);
      setActionPlan(plan);
      setViewMode('plan');
    } catch (err) {
      setMlError('Failed to generate action plan. Please try again later.');
    }
  };
  
  const handleGenerateEnhancedReport = async () => {
    if (!repository) return;
    
    setEnhancedReportLoading(true);
    setEnhancedReportError(null);
    
    try {
      const report = await mlAnalysisService.generateEnhancedAnalysisReport(repository);
      setEnhancedReport(report);
      setViewMode('enhancedReport');
      setEnhancedReportLoading(false);
    } catch (err) {
      setEnhancedReportError('Failed to generate enhanced report. Please try again later.');
      setEnhancedReportLoading(false);
    }
  };

  const handleAnalysisComplete = (predictions: MLPrediction[]) => {
    if (predictions && predictions.length > 0) {
      setMlPrediction(predictions[0]);
    }
    setMlLoading(false);
  };

  const handleAnalysisError = (errorMessage: string) => {
    setMlError(errorMessage);
    setMlLoading(false);
  };
  
  const renderContent = () => {
    if (loading) {
      return <div className="loading">Loading repository details...</div>;
    }
    
    if (error) {
      return <div className="error">{error}</div>;
    }
    
    if (!repository) {
      return <div className="error">Repository not found</div>;
    }
    
    switch (viewMode) {
      case 'insights':
        return (
          <div className="ml-insights">
            {mlLoading ? (
              <MLAnalysisLoader 
                repositories={[repository]} 
                onAnalysisComplete={handleAnalysisComplete} 
                onAnalysisError={handleAnalysisError} 
              />
            ) : mlError ? (
              <MLErrorNotification message={mlError} />
            ) : mlPrediction ? (
              <>
                <div className="refresh-analysis-button" style={{ marginBottom: '15px' }}>
                  <button 
                    onClick={handleAnalyzeRepository} 
                    className="secondary-button"
                    style={{ 
                      padding: '8px 12px', 
                      fontSize: '0.9rem',
                      backgroundColor: '#f5f5f5',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    Refresh Analysis
                  </button>
                </div>
                <MLInsightsBlog repository={repository} prediction={mlPrediction} />
              </>
            ) : (
              <div className="analysis-cta">
                <h3>Get ML-Powered Insights</h3>
                <p>Analyze this repository with our machine learning model to get quality insights and recommendations.</p>
                <button onClick={handleAnalyzeRepository} className="primary-button">
                  Analyze Repository
                </button>
              </div>
            )}
          </div>
        );
      
      case 'plan':
        return (
          <div className="action-plan">
            {actionPlan ? (
              <>
                <div className="refresh-plan-button" style={{ marginBottom: '15px' }}>
                  <button 
                    onClick={handleGenerateActionPlan} 
                    className="secondary-button"
                    style={{ 
                      padding: '8px 12px', 
                      fontSize: '0.9rem',
                      backgroundColor: '#f5f5f5',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    Refresh Action Plan
                  </button>
                </div>
                <DetailedActionPlan plan={actionPlan} repositoryName={repository.name} />
              </>
            ) : (
              <div className="loading">Generating action plan...</div>
            )}
          </div>
        );
      
      case 'enhancedReport':
        return enhancedReportLoading ? (
          <div className="loading">Generating enhanced analysis report...</div>
        ) : enhancedReportError ? (
          <div className="error">{enhancedReportError}</div>
        ) : enhancedReport ? (
          <EnhancedRepositoryReport repository={repository} analysisData={enhancedReport} />
        ) : (
          <div className="analysis-cta">
            <h3>Generate Enhanced Analysis Report</h3>
            <p>Create a comprehensive analysis report with detailed metrics and recommendations.</p>
            <button onClick={handleGenerateEnhancedReport} className="primary-button">
              Generate Enhanced Report
            </button>
          </div>
        );
      
      case 'details':
      default:
        return <RepositoryDetails repository={repository} />;
    }
  };
  
  return (
    <div className="repository-analysis-page">
      <div className="navigation-header">
        <button onClick={() => navigate(-1)} className="back-button">
          &larr; Back
        </button>
        
        {repository && (
          <div className="view-controls">
            <button 
              className={`view-button ${viewMode === 'details' ? 'active' : ''}`}
              onClick={() => setViewMode('details')}
            >
              Details
            </button>
            <button 
              className={`view-button ${viewMode === 'insights' ? 'active' : ''}`}
              onClick={() => setViewMode('insights')}
            >
              ML Insights
            </button>
            <button 
              className={`view-button ${viewMode === 'plan' ? 'active' : ''}`}
              onClick={() => setViewMode('plan')}
            >
              Action Plan
            </button>
            <button 
              className={`view-button ${viewMode === 'enhancedReport' ? 'active' : ''}`}
              onClick={() => setViewMode('enhancedReport')}
            >
              Enhanced Report
            </button>
          </div>
        )}
      </div>
      
      <MLServiceTest repositoryId={repository?.id} />
      
      <div className="content-container">
        {renderContent()}
      </div>
    </div>
  );
};

export default RepositoryAnalysisPage; 