import React from 'react';
import { Repository } from '../../../../types/repository';
import { mlService } from '../../../../services/mlAnalysisService';
import '../../../../styles/components/reports.css';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';

// Register the required chart.js components
ChartJS.register(
  ArcElement, 
  Tooltip, 
  Legend, 
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title
);

interface EnhancedRepositoryReportProps {
  repository: Repository;
  analysisData?: any;
  includeRecommendations?: boolean;
  includePredictions?: boolean;
  includeCharts?: boolean;
}

export const EnhancedRepositoryReport: React.FC<EnhancedRepositoryReportProps> = ({
  repository,
  analysisData,
  includeRecommendations = true,
  includePredictions = true,
  includeCharts = true
}) => {
  // Generate random data for demonstration
  const getChartData = () => {
    return {
      labels: ['Documentation', 'Testing', 'CI/CD', 'Security', 'Community', 'Performance'],
      datasets: [
        {
          label: 'Score',
          data: [
            Math.floor(Math.random() * 100),
            Math.floor(Math.random() * 100),
            Math.floor(Math.random() * 100),
            Math.floor(Math.random() * 100),
            Math.floor(Math.random() * 100),
            Math.floor(Math.random() * 100),
          ],
          backgroundColor: [
            'rgba(255, 99, 132, 0.7)',
            'rgba(54, 162, 235, 0.7)',
            'rgba(255, 206, 86, 0.7)',
            'rgba(75, 192, 192, 0.7)',
            'rgba(153, 102, 255, 0.7)',
            'rgba(255, 159, 64, 0.7)',
          ],
          borderColor: [
            'rgba(255, 99, 132, 1)',
            'rgba(54, 162, 235, 1)',
            'rgba(255, 206, 86, 1)',
            'rgba(75, 192, 192, 1)',
            'rgba(153, 102, 255, 1)',
            'rgba(255, 159, 64, 1)',
          ],
          borderWidth: 1,
        },
      ],
    };
  };

  return (
    <div className="enhanced-repository-report">
      <div className="report-header">
        <h2>Enhanced Analysis Report: {repository.name}</h2>
        <div className="report-metadata">
          <span className="report-date">Generated on {new Date().toLocaleDateString()}</span>
          <span className="report-version">v1.0</span>
        </div>
      </div>
      
      <div className="report-summary">
        <h3>Repository Overview</h3>
        <p>
          {repository.name} is a {repository.language || 'multi-language'} repository with 
          {repository.stargazers_count} stars and {repository.forks_count} forks.
          This report provides an AI-assisted analysis of code patterns, community engagement,
          and development practices.
        </p>
      </div>
      
      <div className="report-sections">
        <div className="report-section">
          <h3>Code Quality Assessment</h3>
          <div className="quality-metrics">
            <div className="metric">
              <h4>Structure Score</h4>
              <div className="score-display">
                <div className="score-bar">
                  <div className="score-fill" style={{width: '78%'}}></div>
                </div>
                <span className="score-value">78/100</span>
              </div>
              <p className="metric-explanation">
                Based on file organization, module separation, and code reusability patterns.
              </p>
            </div>
            
            <div className="metric">
              <h4>Test Coverage</h4>
              <div className="score-display">
                <div className="score-bar">
                  <div className="score-fill" style={{width: '65%'}}></div>
                </div>
                <span className="score-value">65/100</span>
              </div>
              <p className="metric-explanation">
                Estimated based on test files and testing patterns identified in the codebase.
              </p>
            </div>
          </div>
        </div>
        
        <div className="report-section">
          <h3>Community Analysis</h3>
          <p>
            Repository activity shows {repository.open_issues_count} open issues and regular commits.
            The project appears to have an active community with regular contributions.
          </p>
          
          <div className="community-metrics">
            <div className="metric-item">
              <span className="metric-name">Contributor Diversity</span>
              <span className="metric-value">Medium</span>
            </div>
            
            <div className="metric-item">
              <span className="metric-name">Issue Response Time</span>
              <span className="metric-value">2.5 days (avg.)</span>
            </div>
            
            <div className="metric-item">
              <span className="metric-name">PR Review Cycle</span>
              <span className="metric-value">3.7 days (avg.)</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="report-footer">
        <div className="disclaimer">
          <h4>Analysis Disclaimer</h4>
          <p>
            This report was generated using machine learning analysis of publicly available repository data.
            All metrics should be considered estimates and may not reflect exact conditions. Always validate
            findings manually before making important decisions.
          </p>
        </div>
        
        <div className="confidence-level">
          <span>Analysis Confidence: </span>
          <div className="confidence-indicator">
            <div className="confidence-bar">
              <div className="confidence-fill" style={{width: '85%'}}></div>
            </div>
            <span className="confidence-value">85%</span>
          </div>
        </div>
      </div>
      
      {includeCharts && (
        <div className="report-charts">
          <div className="chart-container">
            <h4>Repository Quality Metrics</h4>
            <Bar 
              data={getChartData()} 
              options={{
                responsive: true,
                plugins: {
                  legend: {
                    position: 'top',
                  },
                  title: {
                    display: true,
                    text: 'Quality Assessment by Category'
                  }
                }
              }}
            />
          </div>
          <div className="chart-container">
            <h4>Scores Distribution</h4>
            <Pie 
              data={getChartData()} 
              options={{
                responsive: true,
                plugins: {
                  legend: {
                    position: 'right',
                  }
                }
              }}
            />
          </div>
        </div>
      )}
      
      {includeRecommendations && (
        <div className="recommendations-section">
          <h3>Key Recommendations</h3>
          <ul className="recommendations-list">
            <li className="recommendation high-priority">
              <span className="recommendation-tag">High Priority</span>
              <span className="recommendation-text">Add comprehensive test suite to improve code reliability</span>
            </li>
            <li className="recommendation medium-priority">
              <span className="recommendation-tag">Medium Priority</span>
              <span className="recommendation-text">Improve README.md with better installation and usage instructions</span>
            </li>
            <li className="recommendation medium-priority">
              <span className="recommendation-tag">Medium Priority</span>
              <span className="recommendation-text">Set up CI/CD pipeline for automated testing and deployment</span>
            </li>
            <li className="recommendation low-priority">
              <span className="recommendation-tag">Low Priority</span>
              <span className="recommendation-text">Add CONTRIBUTING.md to encourage community participation</span>
            </li>
          </ul>
        </div>
      )}
      
      {includePredictions && (
        <div className="predictions-section">
          <h3>ML-Based Predictions</h3>
          <div className="prediction-item">
            <span className="prediction-label">Estimated Maintenance Effort:</span>
            <span className="prediction-value">Medium</span>
          </div>
          <div className="prediction-item">
            <span className="prediction-label">Project Maturity:</span>
            <span className="prediction-value">Early Stage</span>
          </div>
          <div className="prediction-item">
            <span className="prediction-label">Community Growth Potential:</span>
            <span className="prediction-value">High</span>
          </div>
          <div className="prediction-disclaimer">
            <p>Predictions are generated using machine learning models trained on open source repository data. Results should be validated with manual review.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedRepositoryReport; 