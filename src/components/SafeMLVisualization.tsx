import React, { useState, useEffect, useCallback } from 'react';
import { mlAnalysisService, MLPrediction } from '../services/mlAnalysisService';

interface SafeMLVisualizationProps {
  repositoryAnalyses: any[];
  mlPredictions: MLPrediction[];
}

const SafeMLVisualization: React.FC<SafeMLVisualizationProps> = ({ 
  repositoryAnalyses, 
  mlPredictions 
}) => {
  // Create a simple canvas-based radar chart without using vulnerable d3 dependencies
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  
  // Safety check for visualization
  const [renderError, setRenderError] = useState<string | null>(null);

  // Use useCallback to memoize the function so it doesn't need to be a dependency
  const drawSafeRadarChart = useCallback((ctx: CanvasRenderingContext2D, width: number, height: number, data: any[]) => {
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(centerX, centerY) - 50;
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    // Draw axis lines
    const categories = ['Documentation', 'CI/CD', 'Testing', 'Features', 'Issues', 'License', 'Activity'];
    const angles = categories.map((_, i) => i * (2 * Math.PI / categories.length));
    
    // Draw axis labels
    ctx.font = '12px Arial';
    ctx.fillStyle = '#333';
    
    angles.forEach((angle, i) => {
      const x = centerX + (radius + 20) * Math.cos(angle);
      const y = centerY + (radius + 20) * Math.sin(angle);
      ctx.fillText(categories[i], x - 20, y);
      
      // Draw axis line
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(centerX + radius * Math.cos(angle), centerY + radius * Math.sin(angle));
      ctx.strokeStyle = '#ddd';
      ctx.stroke();
    });
    
    // Draw data for each repository
    const colors = ['#FF6384', '#36A2EB', '#FFCE56'];
    
    data.forEach((repo, repoIndex) => {
      const values = [
        repo.readmeQualityScore / 100,
        repo.hasCI ? 1 : 0,
        repo.hasTests ? 1 : 0,
        Math.min(1, repo.featureCount / 20),
        repo.issueResolutionRate / 100,
        repo.licensePermissiveness / 100,
        getActivityScore(repo.codebaseMetrics.updateFrequency) / 100
      ];
      
      ctx.beginPath();
      angles.forEach((angle, i) => {
        const value = values[i] * radius;
        const x = centerX + value * Math.cos(angle);
        const y = centerY + value * Math.sin(angle);
        
        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });
      
      // Close the path
      ctx.lineTo(centerX + values[0] * radius * Math.cos(angles[0]), 
                centerY + values[0] * radius * Math.sin(angles[0]));
      
      // Fill with semi-transparent color
      ctx.fillStyle = colors[repoIndex % colors.length] + '40'; // 25% opacity
      ctx.fill();
      
      // Stroke with solid color
      ctx.strokeStyle = colors[repoIndex % colors.length];
      ctx.lineWidth = 2;
      ctx.stroke();
    });
    
    // Add legend
    const legendY = height - 30;
    data.forEach((repo, i) => {
      const legendX = 20 + i * 150;
      
      ctx.fillStyle = colors[i % colors.length];
      ctx.fillRect(legendX, legendY, 15, 15);
      
      ctx.fillStyle = '#333';
      ctx.fillText(repo.repoName, legendX + 20, legendY + 12);
    });
  }, []); // No dependencies since this doesn't rely on props or state
  
  // Keep the activity score function outside useCallback since it doesn't change
  function getActivityScore(updateFrequency: string): number {
    if (updateFrequency.includes("Very Active")) return 90;
    if (updateFrequency.includes("Active")) return 75;
    if (updateFrequency.includes("Maintained")) return 60;
    if (updateFrequency.includes("Slow")) return 40;
    if (updateFrequency.includes("Stale")) return 20;
    return 10; // Abandoned
  }
  
  useEffect(() => {
    try {
      if (!canvasRef.current || repositoryAnalyses.length === 0) return;
      
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        setRenderError("Canvas rendering context not available. Using fallback visualization.");
        return;
      }
      
      // Now drawSafeRadarChart is properly memoized and can be included in dependencies
      drawSafeRadarChart(ctx, canvas.width, canvas.height, repositoryAnalyses);
    } catch (error) {
      console.error("Error rendering ML visualization:", error);
      setRenderError("Could not render visualization. Using fallback mode.");
    }
  }, [repositoryAnalyses, drawSafeRadarChart]); // Add drawSafeRadarChart as a dependency
  
  function getPredictionColor(score: number): string {
    if (score >= 80) return '#4caf50';
    if (score >= 70) return '#8bc34a';
    if (score >= 60) return '#cddc39';
    if (score >= 50) return '#ffeb3b';
    if (score >= 40) return '#ffc107';
    return '#f44336';
  }
  
  return (
    <div className="ml-analysis">
      <h3>Machine Learning Insights</h3>
      
      <div className="ml-visualization">
        <div className="radar-chart">
          <h4>Repository Features Comparison</h4>
          {renderError ? (
            <div className="fallback-visualization">
              <p className="error-message">{renderError}</p>
              <div className="text-visualization">
                {repositoryAnalyses.map((repo, index) => (
                  <div key={index} className="repo-stats">
                    <h5>{repo.repoName}</h5>
                    <ul>
                      <li>Documentation: {repo.readmeQualityScore}%</li>
                      <li>CI/CD: {repo.hasCI ? "Yes" : "No"}</li>
                      <li>Testing: {repo.hasTests ? "Yes" : "No"}</li>
                      <li>Features: {repo.featureCount}</li>
                      <li>Issue Resolution: {repo.issueResolutionRate}%</li>
                      <li>License: {repo.licensePermissiveness}%</li>
                      <li>Activity: {repo.codebaseMetrics.updateFrequency}</li>
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <canvas 
              ref={canvasRef} 
              width={500} 
              height={400} 
              style={{ maxWidth: '100%' }}
            ></canvas>
          )}
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
                      {prediction.topRecommendations.map((rec: string, i: number) => (
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

      <div className="ml-analysis-seo-description">
        <h2 className="visually-hidden">Machine Learning Analysis of GitHub Repositories</h2>
        <div className="visually-hidden">
          <p>
            This visualization uses TensorFlow.js to analyze repository characteristics 
            including documentation quality, CI/CD integration, testing coverage, feature count,
            issue resolution rate, license permissiveness, and development activity.
          </p>
          <p>
            The AI model predicts repository quality scores based on these metrics and
            provides actionable recommendations for improvement.
          </p>
          <ul>
            {repositoryAnalyses.map((repo, i) => (
              <li key={i}>
                Repository {repo.repoName} received a machine learning quality score of 
                {mlPredictions[i]?.predictedScore || 'calculating'}% with 
                {mlPredictions[i]?.confidenceLevel || 'N/A'}% confidence.
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default SafeMLVisualization; 