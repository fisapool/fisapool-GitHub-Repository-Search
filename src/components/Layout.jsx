import '../styles/responsive.css';
import { useEffect } from 'react';
import { removeComparisonElements } from '../utils/cleanupDOM';

function Layout({ children }) {
  useEffect(() => {
    // Remove comparison elements from DOM
    removeComparisonElements();
  }, []);

  return (
    <div className="container">
      <header className="header">
        <h1>GitHub Repository Analyzer</h1>
        <button 
          className="theme-toggle"
          onClick={toggleTheme}
        >
          {isDarkMode ? '☀️ Light Mode' : '🌙 Dark Mode'}
        </button>
      </header>
      
      <div className="search-container">
        <input 
          type="text" 
          className="search-input" 
          placeholder="Search repositories..."
        />
        <button className="search-button">Search</button>
      </div>
      
      {/* Comparison section completely removed */}
      
      <main>
        {children}
      </main>
    </div>
  );
}

export default Layout; 