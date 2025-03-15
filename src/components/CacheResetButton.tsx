import React from 'react';
import { cachingService } from '../services/cachingService';
import { mlAnalysisService } from '../services/mlAnalysisService';

/**
 * Button component that clears all application cache and refreshes the page
 * to ensure the application loads fresh data
 */
const CacheResetButton: React.FC = () => {
  const handleClearCache = () => {
    // Clear all general cache entries
    console.log('Clearing all application cache...');
    cachingService.clear();
    
    // Use the ML service's dedicated cache clearing method
    mlAnalysisService.clearCache();
    
    // Force reload the application
    console.log('Reloading application...');
    window.location.reload();
  };

  return (
    <button 
      onClick={handleClearCache}
      style={{ 
        position: 'fixed', 
        bottom: '20px', 
        right: '20px',
        zIndex: 1000,
        backgroundColor: '#f5f5f5',
        padding: '8px 16px',
        borderRadius: '4px',
        border: '1px solid #0366d6',
        color: '#0366d6',
        fontWeight: 'bold',
        cursor: 'pointer',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}
    >
      Reset Cache & Refresh
    </button>
  );
};

export default CacheResetButton; 