import React, { useState, useEffect } from 'react';
import './styles/global.css';
import './styles/theme.css';
import { githubService } from './services/GitHubService';
import { Repository } from './types/repository';
import { RepositoryList } from './features/repositories/components/RepositoryList';
import { RepositoryDetails } from './features/repositories/components/RepositoryDetails';
import { RepositoryComparison } from './features/repositories/components/RepositoryComparison';
import { EnhancedRepositoryReport } from './features/reports/components/EnhancedRepositoryReport';
import useDarkMode from './hooks/useDarkMode';
import CacheResetButton from './components/CacheResetButton';
import CacheDiagnostics from './components/CacheDiagnostics';

function App() {
  const [darkMode, toggleDarkMode] = useDarkMode();
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [selectedRepository, setSelectedRepository] = useState<Repository | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showReport, setShowReport] = useState(false);
  const [showDiagnostics, setShowDiagnostics] = useState(false);

  useEffect(() => {
    // Add a keydown handler to show diagnostics with Ctrl+Shift+D
    const handleKeyDown = (event: KeyboardEvent) => {
      // Check for Ctrl+Shift+D key combination
      if (event.ctrlKey && event.shiftKey && event.key === 'D') {
        setShowDiagnostics(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const data = await githubService.getRepositories(searchQuery);
      setRepositories(data.items || []);
      setSelectedRepository(null);
      setShowReport(false);
    } catch (err) {
      console.error('Error searching repositories:', err);
      setError('Failed to fetch repositories. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRepositorySelect = (repository: Repository) => {
    setSelectedRepository(repository);
    setShowReport(false);
  };

  const handleGenerateReport = () => {
    if (selectedRepository) {
      setShowReport(true);
    }
  };

  return (
    <div className="app">
      {showDiagnostics && <CacheDiagnostics />}
      
      <header className="app-header">
        <div className="container">
          <h1>GitHub Repository Analyzer</h1>
          <button 
            className="theme-toggle" 
            onClick={toggleDarkMode}
          >
            {darkMode ? '☀️ Light Mode' : '🌙 Dark Mode'}
          </button>
        </div>
      </header>
      
      <main className="container">
        <section className="search-section">
          <form onSubmit={handleSearch}>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search GitHub repositories..."
              className="search-input"
            />
            <button 
              type="submit" 
              className="primary-button"
              disabled={loading}
            >
              {loading ? 'Searching...' : 'Search'}
            </button>
          </form>
        </section>
        
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}
        
        <div className="content-layout">
          <section className="repositories-section">
            {repositories.length > 0 && (
              <RepositoryList 
                repositories={repositories}
                onSelectRepository={handleRepositorySelect}
                selectedRepository={selectedRepository}
              />
            )}
          </section>
          
          {selectedRepository && !showReport && (
            <section className="details-section">
              <RepositoryDetails 
                repository={selectedRepository}
                onShowReport={handleGenerateReport}
              />
            </section>
          )}
          
          {selectedRepository && showReport && (
            <section className="report-section">
              <EnhancedRepositoryReport 
                repository={selectedRepository}
                includeCharts={true}
                includeRecommendations={true}
                includePredictions={true}
              />
              
              <div className="report-actions">
                <button 
                  className="secondary-button"
                  onClick={() => setShowReport(false)}
                >
                  Back to Details
                </button>
              </div>
            </section>
          )}
        </div>
        
        {repositories.length >= 2 && (
          <section className="comparison-section">
            <RepositoryComparison 
              repositories={repositories.slice(0, 3)} // Compare up to 3 repos
            />
          </section>
        )}
      </main>
      
      <footer className="app-footer">
        <div className="container">
          <p>GitHub Repository Analyzer - ML-powered insights for your repositories</p>
          <p>© {new Date().getFullYear()} - All rights reserved</p>
        </div>
      </footer>
      
      <CacheResetButton />
    </div>
  );
}

export default App; 