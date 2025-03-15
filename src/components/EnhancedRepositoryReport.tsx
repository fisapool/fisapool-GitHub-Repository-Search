import React from 'react';
import { EnhancedAnalysisData } from '../services/mlAnalysisService';
import { Repository } from '../types/repository';
import './EnhancedRepositoryReport.css'; // Add this file later if needed

interface EnhancedRepositoryReportProps {
  repository: Repository;
  analysisData: EnhancedAnalysisData;
  exportEnabled?: boolean;
}

const EnhancedRepositoryReport: React.FC<EnhancedRepositoryReportProps> = ({
  repository,
  analysisData,
  exportEnabled = true,
}) => {
  // Handle report export
  const handleExportPDF = () => {
    window.print();
  };

  const formatDate = () => {
    const now = new Date();
    return now.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="enhanced-repository-report">
      <section className="code-quality">
        <h2>Code Quality Assessment</h2>
        <h3>Structure Score</h3>
        <p>{analysisData.codeQualityAssessment.structureScore}/100</p>
        <p>{analysisData.codeQualityAssessment.structureOverview}</p>
        
        <h4>Recommendation:</h4>
        <p>{analysisData.codeQualityAssessment.structureRecommendation}</p>
        
        <h3>Test Coverage</h3>
        <p>{analysisData.codeQualityAssessment.testCoverageScore}/100</p>
        <p>{analysisData.codeQualityAssessment.testCoverageOverview}</p>
        
        <h4>Recommendation:</h4>
        <p>{analysisData.codeQualityAssessment.testCoverageRecommendation}</p>
      </section>
      
      <section className="community-analysis">
        <h2>Community Analysis</h2>
        <p>
          Repository activity shows {repository.open_issues_count} open issues and
          regular commits. The project appears to have an active community with regular contributions.
        </p>
        
        <h3>Contributor Diversity</h3>
        <p>{analysisData.communityAnalysis.contributorDiversity}</p>
        <p>{analysisData.communityAnalysis.contributorDiversityOverview}</p>
        
        {analysisData.communityAnalysis.issueResponseTime && (
          <>
            <h3>Issue Response Time</h3>
            <p>{analysisData.communityAnalysis.issueResponseTime} (avg.)</p>
            <p>{analysisData.communityAnalysis.issueResponseTimeOverview}</p>
          </>
        )}
        
        {analysisData.communityAnalysis.prReviewCycle && (
          <>
            <h3>PR Review Cycle</h3>
            <p>{analysisData.communityAnalysis.prReviewCycle} (avg.)</p>
            <p>{analysisData.communityAnalysis.prReviewCycleOverview}</p>
          </>
        )}
      </section>
      
      <section className="analysis-disclaimer">
        <h2>Analysis Disclaimer</h2>
        <p>
          This report was generated using machine learning analysis of publicly available repository data. 
          All metrics should be considered estimates and may not reflect exact conditions. 
          Always validate findings manually before making important decisions.
        </p>
        <p>
          <strong>Analysis Confidence:</strong> {analysisData.confidenceLevel}%
        </p>
      </section>
      
      <section className="repository-quality-metrics">
        <h2>Repository Quality Metrics</h2>
        <h3>Scores Distribution</h3>
        <ul>
          <li><strong>Code Structure</strong>: {analysisData.repositoryQualityMetrics.codeStructure}/100</li>
          <li><strong>Test Coverage</strong>: {analysisData.repositoryQualityMetrics.testCoverage}/100</li>
          <li><strong>Community Engagement</strong>: {analysisData.repositoryQualityMetrics.communityEngagement}</li>
          <li><strong>Issue Resolution Efficiency</strong>: {analysisData.repositoryQualityMetrics.issueResolutionEfficiency}</li>
        </ul>
      </section>
      
      <section className="key-recommendations">
        <h2>Key Recommendations</h2>
        
        {analysisData.keyRecommendations.map((recommendation, index) => (
          <div key={index}>
            <h3>{recommendation.priority} Priority</h3>
            <ul>
              {recommendation.recommendations.map((rec, recIndex) => (
                <li key={recIndex}>{rec}</li>
              ))}
            </ul>
          </div>
        ))}
      </section>
      
      <section className="ml-based-predictions">
        <h2>ML-Based Predictions</h2>
        
        <h3>Estimated Maintenance Effort:</h3>
        <p>{analysisData.mlBasedPredictions.maintenanceEffort}</p>
        <p>{analysisData.mlBasedPredictions.maintenanceEffortOverview}</p>
        
        <h3>Project Maturity:</h3>
        <p>{analysisData.mlBasedPredictions.projectMaturity}</p>
        <p>{analysisData.mlBasedPredictions.projectMaturityOverview}</p>
        
        <h3>Community Growth Potential:</h3>
        <p>{analysisData.mlBasedPredictions.communityGrowthPotential}</p>
        <p>{analysisData.mlBasedPredictions.communityGrowthPotentialOverview}</p>
      </section>
      
      <section className="conclusion">
        <h2>Conclusion</h2>
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