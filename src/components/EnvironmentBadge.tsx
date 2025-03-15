import React from 'react';

const EnvironmentBadge: React.FC = () => {
  const env = process.env.REACT_APP_ENV || 'development';
  
  return (
    <div className="environment-badge">
      {env}
    </div>
  );
};

export default EnvironmentBadge;
export {}; 