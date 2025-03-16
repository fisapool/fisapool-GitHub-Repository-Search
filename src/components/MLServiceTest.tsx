import React, { useState, useEffect } from 'react';
import { mlAnalysisService } from '../services/mlAnalysisService';

interface MLServiceTestProps {
  repositoryId?: number;
}

const MLServiceTest: React.FC<MLServiceTestProps> = ({ repositoryId }) => {
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  
  useEffect(() => {
    // Just test that we can access the service
    if (mlAnalysisService) {
      console.log('ML Analysis Service is available');
      setIsLoaded(true);
    }
  }, []);
  
  return (
    <div className="ml-service-test">
      <h3>ML Service Connection Test</h3>
      <p>
        Service status: {isLoaded ? '✅ Connected' : '❌ Not connected'}
      </p>
      {repositoryId && (
        <p>Repository ID: {repositoryId}</p>
      )}
    </div>
  );
};

export default MLServiceTest; 