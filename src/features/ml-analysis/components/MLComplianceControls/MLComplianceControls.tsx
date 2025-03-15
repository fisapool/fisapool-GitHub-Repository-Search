import React, { useState } from 'react';
import '../../../../styles/components/analysis.css';

interface MLComplianceControlsProps {
  onAnalysisDepthChange?: (depth: 'basic' | 'standard' | 'deep') => void;
  onDataProcessingToggle?: (enabled: boolean) => void;
  onVisualizationToggle?: (enabled: boolean) => void;
}

const MLComplianceControls: React.FC<MLComplianceControlsProps> = ({
  onAnalysisDepthChange,
  onDataProcessingToggle,
  onVisualizationToggle
}) => {
  const [analysisDepth, setAnalysisDepth] = useState<'basic' | 'standard' | 'deep'>('standard');
  const [dataProcessingEnabled, setDataProcessingEnabled] = useState(true);
  const [visualizationsEnabled, setVisualizationsEnabled] = useState(true);

  const handleAnalysisDepthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newDepth = e.target.value as 'basic' | 'standard' | 'deep';
    setAnalysisDepth(newDepth);
    if (onAnalysisDepthChange) {
      onAnalysisDepthChange(newDepth);
    }
  };

  const handleDataProcessingToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDataProcessingEnabled(e.target.checked);
    if (onDataProcessingToggle) {
      onDataProcessingToggle(e.target.checked);
    }
  };

  const handleVisualizationToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVisualizationsEnabled(e.target.checked);
    if (onVisualizationToggle) {
      onVisualizationToggle(e.target.checked);
    }
  };

  return (
    <div className="ml-controls">
      <h3>ML Analysis Controls</h3>
      
      <div className="control-group">
        <label htmlFor="analysis-depth">Analysis Depth:</label>
        <select 
          id="analysis-depth" 
          value={analysisDepth} 
          onChange={handleAnalysisDepthChange}
        >
          <option value="basic">Basic (Limited Data)</option>
          <option value="standard">Standard (Recommended)</option>
          <option value="deep">Deep (Full Repository Scan)</option>
        </select>
      </div>
      
      <div className="control-group">
        <label htmlFor="data-processing">
          <input
            type="checkbox"
            id="data-processing"
            checked={dataProcessingEnabled}
            onChange={handleDataProcessingToggle}
          />
          Enable ML Data Processing
        </label>
        <p className="control-description">
          Allows processing repository data with machine learning models for insights generation.
        </p>
      </div>
      
      <div className="control-group">
        <label htmlFor="visualizations">
          <input
            type="checkbox"
            id="visualizations"
            checked={visualizationsEnabled}
            onChange={handleVisualizationToggle}
          />
          Enable ML Visualizations
        </label>
        <p className="control-description">
          Shows AI-generated charts and visualizations in the analysis report.
        </p>
      </div>
      
      <div className="compliance-info">
        <p>All ML processing complies with GitHub's terms of service. No sensitive repository data is extracted or stored.</p>
      </div>
    </div>
  );
};

export default MLComplianceControls; 