import React, { useState, useEffect } from 'react';
import { cachingService } from '../services/cachingService';
import { mlAnalysisService } from '../services/mlAnalysisService';

// Define a custom interface that matches what IndexedDB returns
interface IDBDatabaseRecord {
  name: string;
  version?: number;
}

const CacheDiagnostics: React.FC = () => {
  const [localStorageKeys, setLocalStorageKeys] = useState<string[]>([]);
  const [localStorageValues, setLocalStorageValues] = useState<Record<string, any>>({});
  const [sessionStorageKeys, setSessionStorageKeys] = useState<string[]>([]);
  const [indexedDBDatabases, setIndexedDBDatabases] = useState<string[]>([]);
  const [clearStatus, setClearStatus] = useState<string>('');
  
  useEffect(() => {
    // Collect all localStorage keys
    const lsKeys: string[] = [];
    const lsValues: Record<string, any> = {};
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        lsKeys.push(key);
        try {
          lsValues[key] = JSON.parse(localStorage.getItem(key) || '');
        } catch (e) {
          lsValues[key] = localStorage.getItem(key);
        }
      }
    }
    setLocalStorageKeys(lsKeys);
    setLocalStorageValues(lsValues);
    
    // Collect sessionStorage keys
    const ssKeys: string[] = [];
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key) {
        ssKeys.push(key);
      }
    }
    setSessionStorageKeys(ssKeys);
    
    // Check indexedDB if available
    if (window.indexedDB && 'databases' in window.indexedDB) {
      // Using type assertion to handle the promise
      (window.indexedDB.databases() as Promise<IDBDatabaseRecord[]>)
        .then(databases => {
          const dbNames = databases.map(db => db.name || 'unnamed-db');
          setIndexedDBDatabases(dbNames);
        })
        .catch(err => {
          console.error('Error getting IndexedDB databases:', err);
        });
    }
  }, [clearStatus]);
  
  const clearAllBrowserStorage = () => {
    setClearStatus('Clearing all browser storage...');
    
    // Clear localStorage
    localStorage.clear();
    
    // Clear sessionStorage
    sessionStorage.clear();
    
    // Clear indexedDB if available
    if (window.indexedDB) {
      const databases = [...indexedDBDatabases];
      databases.forEach(dbName => {
        const request = window.indexedDB.deleteDatabase(dbName);
        request.onsuccess = () => {
          console.log(`Database ${dbName} successfully deleted`);
        };
        request.onerror = () => {
          console.error(`Error deleting database ${dbName}`);
        };
      });
    }
    
    // Clear application caches
    cachingService.clear();
    mlAnalysisService.clearCache();
    
    // Also try to clear other potential caches
    try {
      if (window.caches) {
        window.caches.keys().then(cacheNames => {
          return Promise.all(
            cacheNames.map(cacheName => {
              return window.caches.delete(cacheName);
            })
          );
        });
      }
    } catch (e) {
      console.error('Error clearing browser caches:', e);
    }
    
    setClearStatus('All browser storage cleared at ' + new Date().toISOString());
  };
  
  const identifyMLCacheEntries = () => {
    return localStorageKeys.filter(key => 
      key.includes('ml') || 
      key.includes('ML') || 
      key.includes('analysis') || 
      key.includes('Analysis') ||
      key.includes('report') ||
      key.includes('Report') ||
      key.includes('repo') ||
      key.includes('Repo') ||
      key.includes('github')
    );
  };
  
  const clearMLCacheOnly = () => {
    const mlCacheKeys = identifyMLCacheEntries();
    
    setClearStatus('Clearing ML-related cache entries: ' + mlCacheKeys.join(', '));
    
    mlCacheKeys.forEach(key => {
      localStorage.removeItem(key);
    });
    
    // Clear cachingService with specific prefixes
    cachingService.clear('github-analyzer-');
    cachingService.clear('ml-analysis-');
    cachingService.clear('repository-');
    
    // Clear mlAnalysisService cache
    mlAnalysisService.clearCache();
    
    setClearStatus('ML cache entries cleared at ' + new Date().toISOString());
  };
  
  const forcePageRefresh = () => {
    window.location.reload();
  };
  
  const clearCacheAndRefresh = () => {
    clearAllBrowserStorage();
    setTimeout(() => {
      forcePageRefresh();
    }, 1000);
  };
  
  return (
    <div style={{ 
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.9)',
      color: 'white',
      padding: '20px',
      overflow: 'auto',
      zIndex: 9999
    }}>
      <h1>Cache Diagnostics</h1>
      
      <div style={{ marginBottom: '20px' }}>
        <h2>Emergency Actions</h2>
        <button
          onClick={clearCacheAndRefresh}
          style={{
            backgroundColor: 'red',
            color: 'white',
            padding: '10px 20px',
            border: 'none',
            borderRadius: '4px',
            fontWeight: 'bold',
            cursor: 'pointer',
            marginRight: '10px'
          }}
        >
          NUCLEAR OPTION: Clear ALL Cache & Refresh
        </button>
        
        <button
          onClick={clearMLCacheOnly}
          style={{
            backgroundColor: 'orange',
            color: 'white',
            padding: '10px 20px',
            border: 'none',
            borderRadius: '4px',
            fontWeight: 'bold',
            cursor: 'pointer',
            marginRight: '10px'
          }}
        >
          Clear ML Cache Only
        </button>
        
        <button
          onClick={forcePageRefresh}
          style={{
            backgroundColor: 'blue',
            color: 'white',
            padding: '10px 20px',
            border: 'none',
            borderRadius: '4px',
            fontWeight: 'bold',
            cursor: 'pointer'
          }}
        >
          Force Page Refresh
        </button>
      </div>
      
      {clearStatus && (
        <div style={{ 
          backgroundColor: '#333', 
          padding: '10px', 
          marginBottom: '20px',
          borderRadius: '4px'
        }}>
          <h3>Status</h3>
          <p>{clearStatus}</p>
        </div>
      )}
      
      <div style={{ marginBottom: '20px' }}>
        <h2>ML-Related Cache Entries</h2>
        <ul style={{ listStyleType: 'none', padding: 0 }}>
          {identifyMLCacheEntries().map(key => (
            <li key={key} style={{ 
              backgroundColor: '#333', 
              padding: '10px', 
              marginBottom: '5px',
              borderRadius: '4px' 
            }}>
              <strong>{key}</strong>
              <button
                onClick={() => {
                  localStorage.removeItem(key);
                  setClearStatus(`Removed cache key: ${key}`);
                }}
                style={{
                  backgroundColor: 'red',
                  color: 'white',
                  padding: '2px 5px',
                  border: 'none',
                  borderRadius: '4px',
                  marginLeft: '10px',
                  cursor: 'pointer'
                }}
              >
                Remove
              </button>
              <pre style={{ 
                backgroundColor: '#222', 
                padding: '10px', 
                overflow: 'auto',
                maxHeight: '100px' 
              }}>
                {JSON.stringify(localStorageValues[key], null, 2)}
              </pre>
            </li>
          ))}
        </ul>
      </div>
      
      <div style={{ marginBottom: '20px' }}>
        <h2>All localStorage Keys ({localStorageKeys.length})</h2>
        <ul style={{ listStyleType: 'none', padding: 0 }}>
          {localStorageKeys.map(key => (
            <li key={key} style={{ marginBottom: '5px' }}>
              <strong>{key}</strong>
            </li>
          ))}
        </ul>
      </div>
      
      <div style={{ marginBottom: '20px' }}>
        <h2>All sessionStorage Keys ({sessionStorageKeys.length})</h2>
        <ul style={{ listStyleType: 'none', padding: 0 }}>
          {sessionStorageKeys.map(key => (
            <li key={key} style={{ marginBottom: '5px' }}>
              <strong>{key}</strong>
            </li>
          ))}
        </ul>
      </div>
      
      <div>
        <h2>IndexedDB Databases ({indexedDBDatabases.length})</h2>
        <ul style={{ listStyleType: 'none', padding: 0 }}>
          {indexedDBDatabases.map(db => (
            <li key={db} style={{ marginBottom: '5px' }}>
              <strong>{db}</strong>
            </li>
          ))}
        </ul>
      </div>
      
      <button
        onClick={() => window.history.back()}
        style={{
          backgroundColor: 'gray',
          color: 'white',
          padding: '10px 20px',
          border: 'none',
          borderRadius: '4px',
          fontWeight: 'bold',
          cursor: 'pointer',
          marginTop: '20px'
        }}
      >
        Go Back
      </button>
    </div>
  );
};

export default CacheDiagnostics; 