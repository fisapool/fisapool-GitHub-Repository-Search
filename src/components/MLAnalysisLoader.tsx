import React, { useState, useEffect } from 'react';
import { mlService } from '../services/mlAnalysisService';

interface MLAnalysisLoaderProps {
  repositories: any[];
  onAnalysisComplete: (results: any[]) => void;
  onAnalysisError: (error: Error) => void;
}

const MLAnalysisLoader: React.FC<MLAnalysisLoaderProps> = ({
  repositories,
  onAnalysisComplete,
  onAnalysisError
}) => {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  
  useEffect(() => {
    let isMounted = true;
    
    const loadAnalysis = async () => {
      if (!repositories || repositories.length === 0) return;
      
      setLoading(true);
      setProgress(10);
      
      try {
        // Simulate progress updates
        const progressInterval = setInterval(() => {
          setProgress(prev => Math.min(prev + 10, 90));
        }, 500);
        
        // Get predictions from ML service
        const predictions = await mlService.generateInsights(repositories);
        
        clearInterval(progressInterval);
        
        if (isMounted) {
          setProgress(100);
          onAnalysisComplete(predictions);
        }
      } catch (error) {
        if (isMounted) {
          console.error('Error in ML analysis:', error);
          onAnalysisError(error instanceof Error ? error : new Error('Unknown error in analysis'));
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };
    
    loadAnalysis();
    
    return () => {
      isMounted = false;
    };
  }, [repositories, onAnalysisComplete, onAnalysisError]);
  
  if (!loading) return null;
  
  return (
    <div className="ml-analysis-loader">
      <div className="loader-content">
        <h3>Analyzing Repositories</h3>
        <div className="progress-bar">
          <div 
            className="progress-fill" 
            style={{ width: `${progress}%` }}
          />
        </div>
        <p>Applying ML models to repository data...</p>
      </div>
    </div>
  );
};

export default MLAnalysisLoader; 