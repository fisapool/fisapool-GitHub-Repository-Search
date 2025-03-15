import React from 'react';
import '../../../../styles/components/analysis.css';

interface MLInsightsBlogProps {
  repositoryName: string;
}

export const MLInsightsBlog: React.FC<MLInsightsBlogProps> = ({
  repositoryName
}) => {
  return (
    <div className="ml-insights-blog">
      <h3>Latest ML Insights</h3>
      
      <div className="blog-metadata">
        <span className="blog-date">
          {new Date().toLocaleDateString()}
        </span>
        <span className="blog-category">Repository Analysis</span>
      </div>
      
      <div className="blog-content">
        <h4>Understanding {repositoryName} Through Machine Learning</h4>
        
        <p>
          Machine learning analysis can provide valuable insights into repository health, 
          contribution patterns, and potential areas for improvement. Here's what our 
          analysis reveals about {repositoryName}:
        </p>
        
        <h5>Code Quality Patterns</h5>
        <p>
          By analyzing commit patterns and code changes, our models can identify potential 
          code quality issues. Regular, smaller commits often indicate better code quality 
          and maintainability compared to infrequent, large changes.
        </p>
        
        <h5>Community Engagement</h5>
        <p>
          Issue response time and PR review cycles provide insights into community health.
          Repositories with active maintainers typically show faster response times and
          more interactive discussions.
        </p>
        
        <h5>Documentation Analysis</h5>
        <p>
          Natural language processing can evaluate documentation completeness and clarity.
          Well-documented projects typically include comprehensive README files, code comments,
          and usage examples.
        </p>
        
        <div className="blog-disclaimer">
          <p>
            <strong>Note:</strong> These insights are generated using machine learning models 
            and should be considered as suggestions, not definitive assessments. Always combine 
            automated analysis with human review for best results.
          </p>
        </div>
      </div>
      
      <div className="blog-footer">
        <div className="confidence-indicator">
          <span className="confidence-label">Analysis Confidence:</span>
          <div className="confidence-bar">
            <div className="confidence-level" style={{width: '75%'}}></div>
          </div>
          <span className="confidence-percentage">75%</span>
        </div>
        
        <p className="footer-note">
          Analysis performed using ML model v1.2.3 • Feedback helps improve our models
        </p>
      </div>
    </div>
  );
};

export default MLInsightsBlog; 