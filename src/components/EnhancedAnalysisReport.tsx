import React from 'react';
import { ChartJS } from '../utils/chartConfig';
import { CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar, Pie, Radar } from 'react-chartjs-2';
import { MLPrediction } from '../services/mlAnalysisService';
import { Repository } from '../types/repository';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

// Add new interfaces for the enhanced analysis report
interface CodeQualityAssessment {
  structureScore: number;
  structureOverview: string;
  structureRecommendation: string;
  testCoverageScore: number;
  testCoverageOverview: string;
  testCoverageRecommendation: string;
}

interface CommunityAnalysis {
  activity: string[];
  contributorDiversity: 'Low' | 'Medium' | 'High';
  contributorDiversityOverview: string;
  issueResponseTime?: string;
  issueResponseTimeOverview?: string;
  prReviewCycle?: string;
  prReviewCycleOverview?: string;
}

interface RepositoryQualityMetrics {
  codeStructure: number;
  testCoverage: number;
  communityEngagement: 'Low' | 'Medium' | 'High';
  issueResolutionEfficiency: 'Low' | 'Medium' | 'High';
}

interface KeyRecommendation {
  priority: 'High' | 'Medium' | 'Low';
  recommendations: string[];
}

interface MLBasedPredictions {
  maintenanceEffort: 'Low' | 'Medium' | 'High';
  maintenanceEffortOverview: string;
  projectMaturity: 'Early Stage' | 'Mature' | 'Stable';
  projectMaturityOverview: string;
  communityGrowthPotential: 'Low' | 'Medium' | 'High';
  communityGrowthPotentialOverview: string;
}

interface EnhancedAnalysisData {
  repositoryName: string;
  generatedDate: string;
  version: string;
  stars?: number;
  forks?: number;
  language?: string;
  codeQualityAssessment: CodeQualityAssessment;
  communityAnalysis: CommunityAnalysis;
  confidenceLevel: number;
  repositoryQualityMetrics: RepositoryQualityMetrics;
  keyRecommendations: KeyRecommendation[];
  mlBasedPredictions: MLBasedPredictions;
  conclusion: string;
}

interface EnhancedRepositoryReportProps {
  repository: Repository;
  analysisData: EnhancedAnalysisData;
  exportEnabled?: boolean;
}

const EnhancedRepositoryReport: React.FC<EnhancedRepositoryReportProps> = ({ 
  repository,
  analysisData,
  exportEnabled = true
}) => {
  // Handle report export
  const handleExportPDF = () => {
    window.print();
  };
  
  return (
    <div className="enhanced-repository-report">
      <div className="report-header">
        <h1>Enhanced Analysis Report</h1>
        <p className="report-metadata">
          <span><strong>Repository Name</strong>: {analysisData.repositoryName}</span><br/>
          <span><strong>Generated on</strong>: {analysisData.generatedDate}</span><br/>
          <span><strong>Version</strong>: {analysisData.version}</span>
        </p>
      </div>
      
      <section className="repository-overview">
        <h2>Repository Overview:</h2>
        <ul>
          <li><strong>Stars</strong>: {repository?.stargazers_count || 'Not available'}</li>
          <li><strong>Forks</strong>: {repository?.forks_count || 'Not available'}</li>
          <li><strong>Language</strong>: {repository?.language || 'Not available'}</li>
        </ul>
        <p>
          This report provides an AI-assisted analysis of code patterns, community engagement, and development practices in the repository.
        </p>
      </section>
      
      <section className="code-quality">
        <h2>Code Quality Assessment:</h2>
        <h3>Structure Score: {analysisData.codeQualityAssessment.structureScore}/100</h3>
        
        <h4>Overview:</h4>
        <p>{analysisData.codeQualityAssessment.structureOverview}</p>
        
        <h4>Recommendation:</h4>
        <p>{analysisData.codeQualityAssessment.structureRecommendation}</p>
        
        <h3>Test Coverage: {analysisData.codeQualityAssessment.testCoverageScore}/100</h3>
        
        <h4>Overview:</h4>
        <p>{analysisData.codeQualityAssessment.testCoverageOverview}</p>
        
        <h4>Recommendation:</h4>
        <p>{analysisData.codeQualityAssessment.testCoverageRecommendation}</p>
      </section>
      
      <section className="community-analysis">
        <h2>Community Analysis:</h2>
        <h3>Repository Activity:</h3>
        <ul>
          {analysisData.communityAnalysis.activity.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
        
        <h3>Contributor Diversity: {analysisData.communityAnalysis.contributorDiversity}</h3>
        <p>{analysisData.communityAnalysis.contributorDiversityOverview}</p>
        
        {analysisData.communityAnalysis.issueResponseTime && (
          <>
            <h3>Issue Response Time: {analysisData.communityAnalysis.issueResponseTime}</h3>
            <p>{analysisData.communityAnalysis.issueResponseTimeOverview}</p>
          </>
        )}
        
        {analysisData.communityAnalysis.prReviewCycle && (
          <>
            <h3>PR Review Cycle: {analysisData.communityAnalysis.prReviewCycle}</h3>
            <p>{analysisData.communityAnalysis.prReviewCycleOverview}</p>
          </>
        )}
      </section>
      
      <section className="analysis-disclaimer">
        <h2>Analysis Disclaimer:</h2>
        <p>
          This report was generated using machine learning analysis of publicly available repository data. 
          All metrics should be considered estimates and may not reflect exact conditions. 
          Always validate findings manually before making important decisions.
        </p>
        <p>
          <strong>Confidence Level</strong>: {analysisData.confidenceLevel}%
        </p>
      </section>
      
      <section className="repository-quality-metrics">
        <h2>Repository Quality Metrics:</h2>
        <h3>Scores Distribution:</h3>
        <ul>
          <li><strong>Code Structure</strong>: {analysisData.repositoryQualityMetrics.codeStructure}/100</li>
          <li><strong>Test Coverage</strong>: {analysisData.repositoryQualityMetrics.testCoverage}/100</li>
          <li><strong>Community Engagement</strong>: {analysisData.repositoryQualityMetrics.communityEngagement}</li>
          <li><strong>Issue Resolution Efficiency</strong>: {analysisData.repositoryQualityMetrics.issueResolutionEfficiency}</li>
        </ul>
      </section>
      
      <section className="key-recommendations">
        <h2>Key Recommendations:</h2>
        
        {analysisData.keyRecommendations.map((recommendation, index) => (
          <div key={index}>
            <h3>{recommendation.priority} Priority:</h3>
            <ul>
              {recommendation.recommendations.map((rec, recIndex) => (
                <li key={recIndex}>{rec}</li>
              ))}
            </ul>
          </div>
        ))}
      </section>
      
      <section className="ml-based-predictions">
        <h2>ML-Based Predictions:</h2>
        
        <h3>Estimated Maintenance Effort: {analysisData.mlBasedPredictions.maintenanceEffort}</h3>
        <p>{analysisData.mlBasedPredictions.maintenanceEffortOverview}</p>
        
        <h3>Project Maturity: {analysisData.mlBasedPredictions.projectMaturity}</h3>
        <p>{analysisData.mlBasedPredictions.projectMaturityOverview}</p>
        
        <h3>Community Growth Potential: {analysisData.mlBasedPredictions.communityGrowthPotential}</h3>
        <p>{analysisData.mlBasedPredictions.communityGrowthPotentialOverview}</p>
      </section>
      
      <section className="conclusion">
        <h2>Conclusion:</h2>
        <p>{analysisData.conclusion}</p>
      </section>
      
      {exportEnabled && (
        <div className="report-actions">
          <button onClick={handleExportPDF} className="export-button">
            Export as PDF
          </button>
        </div>
      )}
    </div>
  );
};

export default EnhancedRepositoryReport; 