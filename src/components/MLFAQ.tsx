import React from 'react';

const MLFAQ: React.FC = () => {
  return (
    <section className="ml-faq">
      <h2>Frequently Asked Questions About ML Repository Analysis</h2>
      
      <div className="faq-item" itemScope itemType="https://schema.org/Question">
        <h3 itemProp="name">How does machine learning improve repository comparison?</h3>
        <div itemScope itemType="https://schema.org/Answer" itemProp="acceptedAnswer">
          <div itemProp="text">
            <p>
              Machine learning improves repository comparison by identifying non-obvious patterns and 
              relationships between repository characteristics. While traditional comparison might focus
              on simple metrics like stars or forks, our ML model analyzes documentation quality, 
              code maintenance patterns, and development practices to provide deeper insights.
            </p>
            <p>
              The model has been trained to recognize patterns that correlate with repository quality
              based on analysis of thousands of open source projects. This allows it to provide
              more nuanced comparison than manually checking individual metrics.
            </p>
          </div>
        </div>
      </div>
      
      <div className="faq-item" itemScope itemType="https://schema.org/Question">
        <h3 itemProp="name">What data does the ML model use to analyze repositories?</h3>
        <div itemScope itemType="https://schema.org/Answer" itemProp="acceptedAnswer">
          <div itemProp="text">
            <p>
              Our ML model analyzes seven key dimensions of repository data:
            </p>
            <ol>
              <li>README quality and completeness</li>
              <li>Presence of CI/CD integration</li>
              <li>Evidence of testing practices</li>
              <li>Feature documentation thoroughness</li>
              <li>Issue resolution rate and responsiveness</li>
              <li>License clarity and permissiveness</li>
              <li>Repository activity and update frequency</li>
            </ol>
            <p>
              The model calculates feature vectors from this data and uses a neural network
              to predict overall repository quality and to identify improvement opportunities.
            </p>
          </div>
        </div>
      </div>
      
      <div className="faq-item" itemScope itemType="https://schema.org/Question">
        <h3 itemProp="name">How accurate is the ML model's repository analysis?</h3>
        <div itemScope itemType="https://schema.org/Answer" itemProp="acceptedAnswer">
          <div itemProp="text">
            <p>
              The model provides a confidence score with each analysis to indicate reliability.
              Typically, repositories with more complete data receive higher confidence scores
              (80-95%), while repositories with limited information may have lower confidence
              (60-75%).
            </p>
            <p>
              While no automated analysis can perfectly capture all aspects of repository quality,
              our internal validation shows strong correlation between ML predictions and expert
              developer assessments. The model is particularly good at identifying well-documented
              repositories with good maintenance practices.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MLFAQ; 