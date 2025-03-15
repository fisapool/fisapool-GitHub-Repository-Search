import React, { useState } from 'react';

interface MLComplianceControlsProps {
  onToggleML: (enabled: boolean) => void;
  onSetAnalysisDepth: (depth: 'basic' | 'standard' | 'comprehensive') => void;
  onSetDataUsagePreference: (preference: 'analysis-only' | 'improve-model' | 'none') => void;
  currentSettings: {
    mlEnabled: boolean;
    analysisDepth: 'basic' | 'standard' | 'comprehensive';
    dataUsagePreference: 'analysis-only' | 'improve-model' | 'none';
  };
}

const MLComplianceControls: React.FC<MLComplianceControlsProps> = ({
  onToggleML,
  onSetAnalysisDepth,
  onSetDataUsagePreference,
  currentSettings
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  return (
    <div className="ml-compliance-controls">
      <div className="compliance-header" onClick={() => setIsExpanded(!isExpanded)}>
        <h4>ML Analysis Controls</h4>
        <span className={`expand-icon ${isExpanded ? 'expanded' : ''}`}>▼</span>
      </div>
      
      {isExpanded && (
        <div className="compliance-options">
          <div className="compliance-option">
            <label htmlFor="ml-toggle">
              <span className="option-title">ML Analysis</span>
              <span className="option-description">Enable machine learning-based repository analysis</span>
            </label>
            <div className="toggle-switch">
              <input
                type="checkbox"
                id="ml-toggle"
                checked={currentSettings.mlEnabled}
                onChange={(e) => onToggleML(e.target.checked)}
              />
              <span className="toggle-slider"></span>
            </div>
          </div>
          
          <div className="compliance-option">
            <label htmlFor="analysis-depth">
              <span className="option-title">Analysis Depth</span>
              <span className="option-description">Control how thoroughly repositories are analyzed</span>
            </label>
            <select
              id="analysis-depth"
              value={currentSettings.analysisDepth}
              onChange={(e) => onSetAnalysisDepth(e.target.value as any)}
              disabled={!currentSettings.mlEnabled}
            >
              <option value="basic">Basic (README, issues only)</option>
              <option value="standard">Standard (Code patterns, PR analysis)</option>
              <option value="comprehensive">Comprehensive (Deep code & workflow analysis)</option>
            </select>
          </div>
          
          <div className="compliance-option">
            <label htmlFor="data-usage">
              <span className="option-title">Data Usage Preference</span>
              <span className="option-description">How your repository data can be used</span>
            </label>
            <select
              id="data-usage"
              value={currentSettings.dataUsagePreference}
              onChange={(e) => onSetDataUsagePreference(e.target.value as any)}
              disabled={!currentSettings.mlEnabled}
            >
              <option value="analysis-only">Analysis only (no data retention)</option>
              <option value="improve-model">Help improve ML model (anonymized)</option>
              <option value="none">No ML analysis or data usage</option>
            </select>
          </div>
          
          <div className="compliance-info">
            <p>
              <strong>Privacy Notice:</strong> All analysis is performed client-side. 
              No repository data is stored on servers unless explicitly permitted through 
              data usage preferences.
            </p>
            <a href="/ml-privacy-policy" className="privacy-link">
              View ML Privacy Policy →
            </a>
          </div>
        </div>
      )}
    </div>
  );
};

export default MLComplianceControls; 