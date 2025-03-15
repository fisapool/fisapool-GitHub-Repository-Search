import React from 'react';

interface MLErrorNotificationProps {
  error: {
    type: 'rate-limit' | 'api-error' | 'model-error' | 'data-error';
    message: string;
    timestamp: Date;
    requestId?: string;
  };
  onDismiss: () => void;
  onRetry?: () => void;
}

const MLErrorNotification: React.FC<MLErrorNotificationProps> = ({
  error,
  onDismiss,
  onRetry
}) => {
  // Determine error icon and color based on type
  let icon = '⚠️';
  let colorClass = 'warning';
  
  switch (error.type) {
    case 'rate-limit':
      icon = '⏱️';
      colorClass = 'rate-limit';
      break;
    case 'api-error':
      icon = '🔌';
      colorClass = 'api';
      break;
    case 'model-error':
      icon = '🤖';
      colorClass = 'model';
      break;
    case 'data-error':
      icon = '📊';
      colorClass = 'data';
      break;
  }
  
  return (
    <div className={`ml-error-notification ${colorClass}`}>
      <div className="error-icon">{icon}</div>
      
      <div className="error-content">
        <h4>ML Analysis Error</h4>
        <p>{error.message}</p>
        <div className="error-meta">
          <span className="timestamp">
            {error.timestamp.toLocaleTimeString()}
          </span>
          {error.requestId && (
            <span className="request-id">
              Request ID: {error.requestId}
            </span>
          )}
        </div>
      </div>
      
      <div className="error-actions">
        {onRetry && (
          <button className="retry-button" onClick={onRetry}>
            Retry
          </button>
        )}
        <button className="dismiss-button" onClick={onDismiss}>
          Dismiss
        </button>
      </div>
    </div>
  );
};

export default MLErrorNotification; 