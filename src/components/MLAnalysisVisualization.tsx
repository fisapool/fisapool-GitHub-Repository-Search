import React from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { Radar } from 'react-chartjs-2';
import { MLPrediction } from '../services/mlAnalysisService';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

// Add radar chart specific configuration
ChartJS.defaults.scale.r = ChartJS.defaults.scale.r || {};
ChartJS.defaults.scale.r.angleLines = { display: true };
ChartJS.defaults.scale.r.suggestedMin = 0;
ChartJS.defaults.scale.r.suggestedMax = 100;

interface MLAnalysisVisualizationProps {
  repositoryAnalyses: any[];
  mlPredictions: MLPrediction[];
}

const MLAnalysisVisualization: React.FC<MLAnalysisVisualizationProps> = ({ 
  repositoryAnalyses, 
  mlPredictions 
}) => {
  // Prepare data for radar chart
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
    datasets: repositoryAnalyses.map((repo, index) => ({
      label: repo.repoName,
      data: [
        repo.readmeQualityScore,
        repo.hasCI ? 100 : 0,
        repo.hasTests ? 100 : 0,
        Math.min(100, repo.featureCount * 5),
        repo.issueResolutionRate,
        repo.licensePermissiveness,
        getActivityScore(repo.codebaseMetrics.updateFrequency)
      ],
      backgroundColor: getBackgroundColor(index, 0.2),
      borderColor: getBackgroundColor(index, 1),
      borderWidth: 1
    }))
  };
  
  const options = {
    plugins: {
      legend: {
        position: 'bottom' as const
      }
    }
  };
  
  function getActivityScore(updateFrequency: string): number {
    if (updateFrequency.includes("Very Active")) return 90;
    if (updateFrequency.includes("Active")) return 75;
    if (updateFrequency.includes("Maintained")) return 60;
    if (updateFrequency.includes("Slow")) return 40;
    if (updateFrequency.includes("Stale")) return 20;
    return 10; // Abandoned
  }
  
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
  
  return (
    <div className="ml-analysis">
      <h3>Machine Learning Insights</h3>
      
      <div className="ml-visualization">
        <div className="radar-chart">
          <h4>Repository Features Comparison</h4>
          <Radar data={radarData} options={options} />
        </div>
        
        <div className="ml-predictions">
          <h4>AI-Powered Quality Assessment</h4>
          <div className="predictions-grid">
            {mlPredictions.map((prediction, index) => (
              <div className="prediction-card" key={index}>
                <div className="prediction-header">
                  <h5>{repositoryAnalyses[index].repoName}</h5>
                  <div className="prediction-score" 
                    style={{
                      backgroundColor: getPredictionColor(prediction.predictedScore)
                    }}>
                    {prediction.predictedScore}%
                  </div>
                </div>
                
                <div className="prediction-body">
                  <p className="insight-summary">{prediction.insightSummary}</p>
                  
                  <div className="prediction-details">
                    <div className="confidence">
                      <span className="label">Confidence:</span>
                      <span className="value">{prediction.confidenceLevel}%</span>
                    </div>
                    
                    {prediction.similarRepositories.length > 0 && (
                      <div className="similar-repos">
                        <span className="label">Similar repositories:</span>
                        <span className="value">{prediction.similarRepositories.join(", ")}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="top-recommendations">
                    <h6>AI Recommendations</h6>
                    <ul>
                      {prediction.topRecommendations.map((rec, i) => (
                        <li key={i}>{rec}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

function getPredictionColor(score: number): string {
  if (score >= 80) return '#4caf50';
  if (score >= 70) return '#8bc34a';
  if (score >= 60) return '#cddc39';
  if (score >= 50) return '#ffeb3b';
  if (score >= 40) return '#ffc107';
  if (score >= 30) return '#ff9800';
  return '#f44336';
}

export default MLAnalysisVisualization; 