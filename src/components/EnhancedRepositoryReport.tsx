import React from 'react';
import { ChartJS } from '../utils/chartConfig';
import { CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar, Pie, Radar } from 'react-chartjs-2';
import { MLPrediction } from '../services/mlAnalysisService';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface RepositoryAnalysisData {
  name: string;
  prediction: MLPrediction;
  timestamp: Date;
  modelVersion: string;
  analysisDepth: 'basic' | 'standard' | 'deep';
  features?: {
    featureCount: number;
    hasCI: boolean;
    hasTests: boolean;
    documentationQuality: 'Low' | 'Medium' | 'High';
    issueQuality: 'Low' | 'Medium' | 'High';
    techStack: string[];
  };
  overallScore?: number;
  recommendations?: Array<{
    recommendation: string;
    currentValue: number;
    targetValue: number;
    improvementPercentage: number;
    effort: 'low' | 'medium' | 'high';
    impact: 'low' | 'medium' | 'high';
  }>;
}

interface EnhancedRepositoryReportProps {
  repositories: RepositoryAnalysisData[];
  exportEnabled?: boolean;
  contactEmail?: string;
}

const EnhancedRepositoryReport: React.FC<EnhancedRepositoryReportProps> = ({ 
  repositories, 
  exportEnabled = true,
  contactEmail = 'support@github-analyzer.com'
}) => {
  // Format date for display
  const formatDate = (date: Date): string => {
    return date.toISOString().replace('T', ' ').substring(0, 19) + ' UTC';
  };
  
  // Get quality label based on score
  const getQualityLabel = (score: number): string => {
    if (score >= 90) return 'excellent';
    if (score >= 70) return 'very good';
    if (score >= 60) return 'good';
    if (score >= 40) return 'average';
    return 'poor';
  };
  
  // Get CSS class for quality score
  const getQualityClass = (score: number): string => {
    if (score >= 90) return 'quality-excellent';
    if (score >= 70) return 'quality-very-good';
    if (score >= 60) return 'quality-good';
    if (score >= 40) return 'quality-fair';
    return 'quality-poor';
  };
  
  // Prepare radar data for comparison
  const radarData = {
    labels: [
      'Documentation',
      'CI/CD',
      'Testing',
      'Features',
      'Issue Resolution',
      'License',
      'Activity'
    ],
    datasets: repositories.map((repo, index) => ({
      label: repo.name,
      data: [
        repo.features?.documentationQuality === 'High' ? 100 : 
        repo.features?.documentationQuality === 'Medium' ? 60 : 30,
        repo.features?.hasCI ? 100 : 0,
        repo.features?.hasTests ? 100 : 0,
        (repo.features?.featureCount || 0) * 5,
        repo.prediction.predictedScore,
        80, // Placeholder for license permissiveness
        70  // Placeholder for activity score
      ],
      backgroundColor: getBackgroundColor(index, 0.2),
      borderColor: getBackgroundColor(index, 1),
      borderWidth: 1
    }))
  };
  
  function getBackgroundColor(index: number, alpha: number): string {
    const colors = [
      `rgba(255, 99, 132, ${alpha})`,
      `rgba(54, 162, 235, ${alpha})`,
      `rgba(255, 206, 86, ${alpha})`,
      `rgba(75, 192, 192, ${alpha})`,
      `rgba(153, 102, 255, ${alpha})`,
      `rgba(255, 159, 64, ${alpha})`
    ];
    
    return colors[index % colors.length];
  }
  
  // Handle report export
  const handleExportPDF = () => {
    window.print();
  };
  
  return (
    <div className="enhanced-repository-report">
      <div className="report-header">
        <h1>Repository Analysis Report</h1>
        <p className="report-metadata">
          <span>Analysis Date: {formatDate(new Date())}</span>
          <span>Model Version: {repositories[0]?.modelVersion || 'v1.2.3'}</span>
        </p>
      </div>
      
      <section>
        <h2>Comparison Results</h2>
        
        <h3>Overall Scores</h3>
        <div className="summary-table-container">
          <table className="summary-table">
            <thead>
              <tr>
                <th>Repository Name</th>
                <th>Overall Score</th>
                <th>Documentation</th>
                <th>Issues</th>
                <th>Tech Stack</th>
              </tr>
            </thead>
            <tbody>
              {repositories.map((repo, index) => (
                <tr key={index}>
                  <td><strong>{repo.name}</strong></td>
                  <td className={getQualityClass(repo.prediction.predictedScore)}>
                    {repo.prediction.predictedScore}%
                  </td>
                  <td>{repo.features?.documentationQuality || 'Medium'}</td>
                  <td>{repo.features?.issueQuality || 'Medium'}</td>
                  <td>{repo.features?.techStack?.join(', ') || 'Not specified'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <h3>Feature Metrics</h3>
        <div className="summary-table-container">
          <table className="summary-table">
            <thead>
              <tr>
                <th>Feature</th>
                {repositories.map((repo, index) => (
                  <th key={index}>{repo.name}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Features Count</td>
                {repositories.map((repo, index) => (
                  <td key={index}>{repo.features?.featureCount || 0}</td>
                ))}
              </tr>
              <tr>
                <td>CI Integration</td>
                {repositories.map((repo, index) => (
                  <td key={index}>{repo.features?.hasCI ? '✅' : '❌'}</td>
                ))}
              </tr>
              <tr>
                <td>Testing</td>
                {repositories.map((repo, index) => (
                  <td key={index}>{repo.features?.hasTests ? '✅' : '❌'}</td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
        
        <hr className="section-divider" />
      </section>
      
      <section>
        <h2>Machine Learning Insights</h2>
        
        <div className="ml-visualization">
          <h3>Repository Features Comparison</h3>
          <p>This section provides AI-powered quality assessments based on machine learning analysis.</p>
          
          <div className="radar-chart">
            <Radar 
              data={radarData} 
              options={{
                responsive: true,
                plugins: {
                  legend: {
                    position: 'top' as const
                  }
                }
              }}
            />
          </div>
        </div>
        
        {repositories.map((repo, index) => (
          <div key={index} className="ml-prediction-section">
            <h4>{repo.name}</h4>
            <ul className="ml-prediction-details">
              <li><strong>Quality Score</strong>: {repo.prediction.predictedScore}%</li>
              <li><strong>Confidence</strong>: {repo.prediction.confidenceLevel}%</li>
              <li><strong>Insight Summary</strong>: {repo.name} has {getQualityLabel(repo.prediction.predictedScore)} characteristics with a predicted quality score of {repo.prediction.predictedScore}%.</li>
              <li>
                <strong>AI Recommendations</strong>:
                <ul className="recommendations-list">
                  {repo.prediction.topRecommendations.map((rec, idx) => (
                    <li key={idx}>{rec}</li>
                  ))}
                </ul>
              </li>
            </ul>
          </div>
        ))}
        
        <hr className="section-divider" />
      </section>
      
      <section>
        <h2>Detailed Analysis</h2>
        
        {repositories.map((repo, index) => (
          <div key={index} className="detailed-analysis-section">
            <h3>{repo.name}</h3>
            <ul className="analysis-summary">
              <li><strong>Current Quality Score</strong>: {repo.prediction.predictedScore}%</li>
              <li><strong>Improvement Opportunities</strong>: {repo.recommendations?.length || 0} key improvements identified.</li>
              <li><strong>Analysis Last Updated</strong>: {formatDate(repo.timestamp)}</li>
            </ul>
            
            <h4>Quantified Improvement Opportunities</h4>
            {repo.recommendations && repo.recommendations.length > 0 ? (
              <div className="summary-table-container">
                <table className="summary-table">
                  <thead>
                    <tr>
                      <th>Recommendation</th>
                      <th>Current</th>
                      <th>Target</th>
                      <th>Improvement</th>
                      <th>Effort</th>
                      <th>Impact</th>
                    </tr>
                  </thead>
                  <tbody>
                    {repo.recommendations.map((rec, idx) => (
                      <tr key={idx}>
                        <td>{rec.recommendation}</td>
                        <td>{rec.currentValue}</td>
                        <td>{rec.targetValue}</td>
                        <td>{rec.improvementPercentage}%</td>
                        <td>
                          <span className={`effort-badge effort-${rec.effort}`}>
                            {rec.effort}
                          </span>
                        </td>
                        <td>
                          <span className={`impact-badge impact-${rec.impact}`}>
                            {rec.impact}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p>[No improvements identified]</p>
            )}
            
            <h4>Effort vs Impact Distribution</h4>
            <p>[Visualization]</p>
            
            <h4>Detailed Recommendations</h4>
            {repo.recommendations && repo.recommendations.length > 0 ? (
              <ul className="detailed-recommendations">
                {repo.recommendations.map((rec, idx) => (
                  <li key={idx}>{rec.recommendation}</li>
                ))}
              </ul>
            ) : (
              <p>[No recommendations]</p>
            )}
          </div>
        ))}
        
        <hr className="section-divider" />
      </section>
      
      <section>
        <h2>Machine Learning Analysis of GitHub Repositories</h2>
        <p>
          This visualization uses TensorFlow.js to analyze repository characteristics including:
        </p>
        <ul>
          <li>Documentation quality</li>
          <li>CI/CD integration</li>
          <li>Testing coverage</li>
          <li>Feature count</li>
          <li>Issue resolution rate</li>
          <li>License permissiveness</li>
          <li>Development activity</li>
        </ul>
        <p>
          The AI model predicts repository quality scores based on these metrics and provides 
          actionable recommendations for improvement.
        </p>
        
        <h3>Summary</h3>
        <ul>
          {repositories.map((repo, index) => (
            <li key={index}>
              <strong>Repository {repo.name}</strong>: Quality Score {repo.prediction.predictedScore}%, 
              Confidence {repo.prediction.confidenceLevel}%
            </li>
          ))}
        </ul>
        
        <hr className="section-divider" />
      </section>
      
      <section>
        <h2>AI-Generated Analysis</h2>
        <p className="ai-disclaimer">
          These improvement recommendations are generated by a machine learning model with 
          {repositories[0]?.prediction.confidenceLevel || 95}% confidence. Results should be 
          verified through manual code review.
        </p>
        
        <hr className="section-divider" />
      </section>
      
      {exportEnabled && (
        <section className="export-options">
          <div className="export-buttons">
            <button onClick={handleExportPDF} className="export-button">
              <span className="export-icon">📄</span>
              Export as PDF
            </button>
          </div>
        </section>
      )}
      
      <footer className="report-footer">
        <h2>Contact Information</h2>
        <p>For further details or questions, please contact <a href={`mailto:${contactEmail}`}>{contactEmail}</a></p>
        <p className="generated-timestamp">Report generated on {new Date().toLocaleString()}</p>
      </footer>
    </div>
  );
};

export default EnhancedRepositoryReport; 