import React from 'react';

interface MLErrorNotificationProps {
  message: string;
  onDismiss?: () => void;
  onRetry?: () => void;
}

const MLErrorNotification: React.FC<MLErrorNotificationProps> = ({
  message,
  onDismiss,
  onRetry
}) => {
  return (
    <div className="ml-error-notification warning">
      <div className="error-icon">⚠️</div>
      
      <div className="error-content">
        <h4>ML Analysis Error</h4>
        <p>{message}</p>
        <div className="error-meta">
          <span className="timestamp">
            {new Date().toLocaleTimeString()}
          </span>
        </div>
      </div>
      
      <div className="error-actions">
        {onRetry && (
          <button className="retry-button" onClick={onRetry}>
            Retry
          </button>
        )}
        {onDismiss && (
          <button className="dismiss-button" onClick={onDismiss}>
            Dismiss
          </button>
        )}
      </div>
    </div>
  );
};

export default MLErrorNotification; 