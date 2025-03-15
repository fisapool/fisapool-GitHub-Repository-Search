import React from 'react';

const MLInsightsBlog: React.FC = () => {
  return (
    <div className="ml-insights-blog">
      <div className="blog-header">
        <h1>Understanding ML-Powered Repository Analysis</h1>
        <div className="blog-meta">
          <span className="date">Updated: September 2023</span>
          <span className="author">GitHub Analyzer Team</span>
        </div>
      </div>
      
      <div className="blog-content">
        <section id="introduction">
          <h2>Introduction to ML Repository Analysis</h2>
          <p>
            Our ML-powered repository analysis tool uses advanced machine learning techniques to 
            analyze GitHub repositories and provide actionable insights. This document explains how 
            the system works, what data it uses, and how to control your privacy settings.
          </p>
          
          <div className="info-box">
            <h3>Key Benefits:</h3>
            <ul>
              <li>Identify improvement opportunities with quantifiable metrics</li>
              <li>Compare repositories objectively using consistent measurements</li>
              <li>Discover patterns across repositories that may not be immediately visible</li>
              <li>Get AI-generated recommendations tailored to your repositories</li>
            </ul>
          </div>
        </section>
        
        <section id="how-it-works">
          <h2>How the ML Analysis Works</h2>
          
          <div className="workflow-diagram">
            <div className="workflow-step">
              <div className="step-number">1</div>
              <div className="step-content">
                <h4>Data Collection</h4>
                <p>Public repository data is collected via GitHub's API, including README content, issues, PRs, and code structure.</p>
              </div>
            </div>
            
            <div className="workflow-step">
              <div className="step-number">2</div>
              <div className="step-content">
                <h4>Feature Extraction</h4>
                <p>Repository metrics are extracted, such as documentation quality, CI/CD setup, testing practices, etc.</p>
              </div>
            </div>
            
            <div className="workflow-step">
              <div className="step-number">3</div>
              <div className="step-content">
                <h4>ML Prediction</h4>
                <p>Our neural network model evaluates the features to generate quality scores and recommendations.</p>
              </div>
            </div>
            
            <div className="workflow-step">
              <div className="step-number">4</div>
              <div className="step-content">
                <h4>Insight Generation</h4>
                <p>Quantifiable recommendations are created, each with predicted impact and effort estimates.</p>
              </div>
            </div>
          </div>
          
          <h3>The ML Model</h3>
          <p>
            Our model is a neural network trained on over 25,000 real GitHub repositories. It uses a 
            sequential architecture with several dense layers to predict repository quality and 
            identify areas for improvement.
          </p>
          
          <div className="tech-stack">
            <h4>Technology Stack:</h4>
            <ul>
              <li><strong>TensorFlow.js</strong> - Client-side ML inference</li>
              <li><strong>GitHub API</strong> - Data collection</li>
              <li><strong>React</strong> - Front-end visualization</li>
            </ul>
          </div>
        </section>
        
        <section id="privacy-controls">
          <h2>Privacy and Control Options</h2>
          
          <p>
            We take privacy seriously and have implemented several controls to give you complete 
            control over your data and the ML analysis.
          </p>
          
          <h3>Data Usage Controls</h3>
          <p>
            You can control how your repository data is used by selecting from these options:
          </p>
          
          <div className="options-table">
            <table>
              <thead>
                <tr>
                  <th>Setting</th>
                  <th>Description</th>
                  <th>Data Handling</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Analysis Only</td>
                  <td>Data is used only for the current analysis session</td>
                  <td>Temporary, client-side only</td>
                </tr>
                <tr>
                  <td>Improve Model</td>
                  <td>Anonymized data helps improve our ML model</td>
                  <td>Anonymized, no repository identifiers</td>
                </tr>
                <tr>
                  <td>No ML Analysis</td>
                  <td>Disables all ML features</td>
                  <td>No ML analysis performed</td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <h3>Analysis Depth Controls</h3>
          <p>
            You can also control how deeply the system analyzes repositories:
          </p>
          
          <div className="depth-options">
            <div className="depth-option">
              <h4>Basic</h4>
              <p>Analyzes only the README and issue data</p>
              <ul>
                <li>Documentation scoring</li>
                <li>Issue categorization</li>
                <li>Basic structure analysis</li>
              </ul>
            </div>
            
            <div className="depth-option">
              <h4>Standard</h4>
              <p>Includes basic analysis plus code patterns and PR data</p>
              <ul>
                <li>Code organization patterns</li>
                <li>PR workflow analysis</li>
                <li>Testing implementation detection</li>
              </ul>
            </div>
            
            <div className="depth-option">
              <h4>Comprehensive</h4>
              <p>Most detailed analysis including code quality metrics</p>
              <ul>
                <li>Deep code analysis</li>
                <li>Security practice detection</li>
                <li>Detailed workflow patterns</li>
                <li>Performance optimization suggestions</li>
              </ul>
            </div>
          </div>
        </section>
        
        <section id="data-security">
          <h2>Data Security and Privacy</h2>
          
          <div className="security-features">
            <div className="security-feature">
              <h3>Client-Side Processing</h3>
              <p>
                All ML analysis is performed in your browser. Your repository data is not sent to 
                any external servers for processing.
              </p>
            </div>
            
            <div className="security-feature">
              <h3>API Key Encryption</h3>
              <p>
                If you provide a GitHub API key for accessing private repositories, it is encrypted 
                using AES encryption and stored only on your device.
              </p>
            </div>
            
            <div className="security-feature">
              <h3>Data Retention</h3>
              <p>
                You can clear all stored data at any time using the "Clear All ML Data" button 
                in the ML Model Information section.
              </p>
            </div>
            
            <div className="security-feature">
              <h3>Rate Limiting</h3>
              <p>
                To prevent API abuse, the system implements rate limiting on GitHub API requests 
                and ML analysis operations.
              </p>
            </div>
          </div>
        </section>
        
        <section id="faq">
          <h2>Frequently Asked Questions</h2>
          
          <div className="faq-item">
            <h3>Is my private repository data safe?</h3>
            <p>
              Yes. All analysis happens in your browser. If you enable analysis of private 
              repositories, your API key is encrypted and stored only on your device.
            </p>
          </div>
          
          <div className="faq-item">
            <h3>How accurate is the ML model?</h3>
            <p>
              Our current model has an accuracy of approximately 87% on validation data. 
              Recommendations display confidence levels, and you should always verify 
              suggestions with manual review.
            </p>
          </div>
          
          <div className="faq-item">
            <h3>Can I use this tool for enterprise repositories?</h3>
            <p>
              Yes, but we recommend consulting your organization's data policies first. 
              The tool can be configured to analyze without storing any data.
            </p>
          </div>
          
          <div className="faq-item">
            <h3>How often is the ML model updated?</h3>
            <p>
              We update our model quarterly to incorporate the latest development best practices 
              and GitHub feature support.
            </p>
          </div>
          
          <div className="faq-item">
            <h3>Can I export the analysis results?</h3>
            <p>
              Yes, you can export analysis results as JSON data using the "Export ML Analysis Data" 
              button. This lets you save, share, or further analyze the results.
            </p>
          </div>
        </section>
        
        <section id="bias-fairness">
          <h2>Bias and Fairness</h2>
          <p>
            Machine learning systems can reflect biases in their training data. We actively work to 
            identify and mitigate bias in our model through:
          </p>
          
          <ul>
            <li>Regular bias audits</li>
            <li>Diverse training data spanning many repository types</li>
            <li>Transparency about model limitations</li>
            <li>Alternative non-ML views of all data</li>
          </ul>
          
          <p>
            Current known limitations include a bias toward conventional project structures 
            and popular programming languages. We're continuously working to improve this.
          </p>
        </section>
      </div>
      
      <div className="blog-footer">
        <div className="footer-links">
          <a href="/privacy-policy">Privacy Policy</a>
          <a href="/terms">Terms of Service</a>
          <a href="/contact">Contact Us</a>
        </div>
        <p className="copyright">
          © 2023 GitHub Repository Analyzer. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default MLInsightsBlog; 