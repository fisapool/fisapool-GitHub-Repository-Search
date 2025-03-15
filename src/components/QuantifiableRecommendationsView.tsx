import React from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

export interface Recommendation {
  recommendation: string;
  currentValue: number;
  targetValue: number;
  improvementPercentage: number;
  effort: 'low' | 'medium' | 'high';
  impact: 'low' | 'medium' | 'high';
}

interface QuantifiableRecommendationsViewProps {
  recommendations: Recommendation[];
  showDataFreshness?: boolean;
  lastUpdated?: Date;
  repositoryName?: string;
}

const QuantifiableRecommendationsView: React.FC<QuantifiableRecommendationsViewProps> = ({
  recommendations,
  showDataFreshness = true,
  lastUpdated = new Date(),
  repositoryName
}) => {
  // Update title if repositoryName is provided
  const titleText = repositoryName 
    ? `Quantified Improvement Opportunities for ${repositoryName}`
    : "Quantified Improvement Opportunities";

  // Convert effort and impact to numerical values for visualization
  const effortMap = { 'low': 1, 'medium': 2, 'high': 3 };
  const impactMap = { 'low': 1, 'medium': 2, 'high': 3 };
  
  // Prepare data for bar chart
  const barChartData = {
    labels: recommendations.map(r => r.recommendation.length > 30 
      ? r.recommendation.substring(0, 30) + '...' 
      : r.recommendation),
    datasets: [
      {
        label: 'Current Value',
        data: recommendations.map(r => r.currentValue),
        backgroundColor: 'rgba(54, 162, 235, 0.5)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1
      },
      {
        label: 'Target Value',
        data: recommendations.map(r => r.targetValue),
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1
      }
    ]
  };
  
  // Prepare data for effort-impact matrix (doughnut chart)
  const matrixCounts = { 
    'highImpactLowEffort': 0,
    'highImpactMediumEffort': 0, 
    'highImpactHighEffort': 0,
    'mediumImpactLowEffort': 0,
    'mediumImpactMediumEffort': 0,
    'mediumImpactHighEffort': 0,
    'lowImpactLowEffort': 0,
    'lowImpactMediumEffort': 0,
    'lowImpactHighEffort': 0
  };
  
  recommendations.forEach(r => {
    const key = `${r.impact}Impact${r.effort.charAt(0).toUpperCase() + r.effort.slice(1)}Effort`;
    // @ts-ignore - Dynamic key access
    matrixCounts[key]++;
  });
  
  const doughnutData = {
    labels: [
      'High Impact, Low Effort',
      'High Impact, Medium Effort',
      'High Impact, High Effort',
      'Medium Impact, Low Effort',
      'Medium Impact, Medium Effort',
      'Medium Impact, High Effort',
      'Low Impact, Low Effort',
      'Low Impact, Medium Effort',
      'Low Impact, High Effort'
    ],
    datasets: [
      {
        data: [
          matrixCounts.highImpactLowEffort,
          matrixCounts.highImpactMediumEffort,
          matrixCounts.highImpactHighEffort,
          matrixCounts.mediumImpactLowEffort,
          matrixCounts.mediumImpactMediumEffort,
          matrixCounts.mediumImpactHighEffort,
          matrixCounts.lowImpactLowEffort,
          matrixCounts.lowImpactMediumEffort,
          matrixCounts.lowImpactHighEffort
        ],
        backgroundColor: [
          'rgba(75, 192, 192, 0.8)',
          'rgba(75, 192, 192, 0.5)',
          'rgba(75, 192, 192, 0.3)',
          'rgba(54, 162, 235, 0.8)',
          'rgba(54, 162, 235, 0.5)',
          'rgba(54, 162, 235, 0.3)',
          'rgba(255, 159, 64, 0.8)',
          'rgba(255, 159, 64, 0.5)',
          'rgba(255, 159, 64, 0.3)'
        ],
        borderWidth: 1
      },
    ],
  };
  
  return (
    <div className="quantifiable-recommendations">
      <h3>{titleText}</h3>
      
      {showDataFreshness && lastUpdated && (
        <div className="data-freshness">
          Analysis last updated: {lastUpdated.toLocaleDateString()} {lastUpdated.toLocaleTimeString()}
        </div>
      )}
      
      <div className="charts-container">
        <div className="chart-wrapper">
          <h4>Current vs Target Metrics</h4>
          <Bar 
            data={barChartData} 
            options={{
              responsive: true,
              scales: {
                y: {
                  beginAtZero: true,
                  max: 100,
                  ticks: {
                    stepSize: 20
                  }
                } as any
              }
            }} 
          />
        </div>
        
        <div className="chart-wrapper">
          <h4>Effort vs Impact Distribution</h4>
          <Doughnut 
            data={doughnutData}
            options={{
              responsive: true,
              plugins: {
                legend: {
                  position: 'right',
                  labels: {
                    font: {
                      size: 10
                    }
                  }
                }
              }
            }} 
          />
        </div>
      </div>
      
      <div className="recommendations-table">
        <h4>Detailed Recommendations</h4>
        <table>
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
            {recommendations.map((rec, index) => (
              <tr key={index}>
                <td>{rec.recommendation}</td>
                <td>{rec.currentValue}</td>
                <td>{rec.targetValue}</td>
                <td>+{rec.improvementPercentage}%</td>
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
    </div>
  );
};

export default QuantifiableRecommendationsView; 