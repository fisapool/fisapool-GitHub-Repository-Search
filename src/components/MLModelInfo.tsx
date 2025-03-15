import React from 'react';

interface MLModelInfoProps {
  modelVersion: string;
  lastUpdated: Date;
  dataPoints: number;
  accuracy: number;
  biasAuditStatus: 'passed' | 'review' | 'failed';
}

const MLModelInfo: React.FC<MLModelInfoProps> = ({
  modelVersion,
  lastUpdated,
  dataPoints,
  accuracy,
  biasAuditStatus
}) => {
  return (
    <div className="ml-model-info">
      <h4>ML Model Information</h4>
      
      <table className="model-info-table">
        <tbody>
          <tr>
            <td>Model Version:</td>
            <td>{modelVersion}</td>
          </tr>
          <tr>
            <td>Last Updated:</td>
            <td>{lastUpdated.toLocaleDateString()}</td>
          </tr>
          <tr>
            <td>Training Data:</td>
            <td>{dataPoints.toLocaleString()} repository samples</td>
          </tr>
          <tr>
            <td>Model Accuracy:</td>
            <td>{accuracy}% on validation set</td>
          </tr>
          <tr>
            <td>Bias Audit Status:</td>
            <td>
              <span className={`bias-status bias-${biasAuditStatus}`}>
                {biasAuditStatus === 'passed' ? 'Passed' : 
                 biasAuditStatus === 'review' ? 'Under Review' : 'Failed'}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
      
      <div className="model-limitations">
        <h5>Known Limitations</h5>
        <ul>
          <li>Analysis focuses on public repository patterns only</li>
          <li>Language-specific features limited to popular languages</li>
          <li>Strong bias toward conventional project structures</li>
          <li>Limited analysis of non-code assets (images, data files)</li>
        </ul>
      </div>
      
      <div className="verify-results">
        <button className="verify-button">
          Verify ML Results with Static Analysis
        </button>
      </div>
    </div>
  );
};

export default MLModelInfo; 