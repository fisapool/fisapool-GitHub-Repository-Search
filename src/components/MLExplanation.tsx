import React from 'react';

const MLExplanation: React.FC = () => {
  return (
    <div className="ml-explanation">
      <h2>How Our Machine Learning Model Analyzes Repositories</h2>
      
      <section className="ml-methodology">
        <h3>ML Methodology</h3>
        <p>
          Our repository analysis tool uses a TensorFlow.js neural network with three fully-connected layers 
          to analyze repositories across seven key dimensions. The model was trained on data from popular 
          open-source repositories to identify patterns that correlate with repository quality and maintainability.
        </p>
        
        <div className="model-architecture">
          <h4>Model Architecture</h4>
          <ul>
            <li>Input layer: 7 neurons (one for each repository feature)</li>
            <li>Hidden layer 1: 12 neurons with ReLU activation</li>
            <li>Hidden layer 2: 8 neurons with ReLU activation</li>
            <li>Output layer: 1 neuron with sigmoid activation (quality score)</li>
          </ul>
        </div>
      </section>
      
      <section className="ml-features">
        <h3>Features Used in Analysis</h3>
        <table className="features-table">
          <thead>
            <tr>
              <th>Feature</th>
              <th>What It Measures</th>
              <th>Why It Matters</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Documentation Quality</td>
              <td>Completeness and clarity of README</td>
              <td>Indicates how easily developers can understand the project</td>
            </tr>
            <tr>
              <td>CI/CD Integration</td>
              <td>Presence of continuous integration</td>
              <td>Suggests code quality control processes</td>
            </tr>
            <tr>
              <td>Testing</td>
              <td>Presence of automated tests</td>
              <td>Indicates code reliability and maintainability</td>
            </tr>
            <tr>
              <td>Feature Documentation</td>
              <td>Clarity of feature descriptions</td>
              <td>Shows how well the project functionality is explained</td>
            </tr>
            <tr>
              <td>Issue Resolution</td>
              <td>Rate at which issues are addressed</td>
              <td>Reflects maintainer responsiveness</td>
            </tr>
            <tr>
              <td>License Clarity</td>
              <td>How well the license is defined</td>
              <td>Important for legal compliance in dependency use</td>
            </tr>
            <tr>
              <td>Activity</td>
              <td>Frequency of repository updates</td>
              <td>Indicates project health and ongoing development</td>
            </tr>
          </tbody>
        </table>
      </section>
      
      <section className="ml-limitations">
        <h3>Model Limitations and Confidence</h3>
        <p>
          Our model provides confidence scores with each prediction to indicate reliability.
          The confidence is based on the amount of available data and the consistency of patterns.
          Repositories with sparse information will have lower confidence scores.
        </p>
        <p>
          This model focuses on observable characteristics and cannot evaluate code quality directly.
          Results should be considered as helpful guidance rather than definitive assessments.
        </p>
      </section>
    </div>
  );
};

export default MLExplanation; 