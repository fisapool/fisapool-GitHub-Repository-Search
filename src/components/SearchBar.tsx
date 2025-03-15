import React, { useState } from 'react';

interface SearchBarProps {
  onSearch: (query: string) => void;
  searchHistory: string[];
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch, searchHistory }) => {
  const [query, setQuery] = useState('');
  const [showHistory, setShowHistory] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query);
      setShowHistory(false);
    }
  };

  const handleHistoryItemClick = (item: string) => {
    setQuery(item);
    onSearch(item);
    setShowHistory(false);
  };

  return (
    <div className="search-bar-container">
      <form onSubmit={handleSubmit}>
        <div className="search-input-wrapper">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search repositories..."
            onFocus={() => searchHistory.length > 0 && setShowHistory(true)}
            onBlur={() => setTimeout(() => setShowHistory(false), 200)}
          />
          <button type="submit">Search</button>
        </div>
        
        {showHistory && searchHistory.length > 0 && (
          <div className="search-history">
            <h4>Recent Searches</h4>
            <ul>
              {searchHistory.map((item, index) => (
                <li key={index} onClick={() => handleHistoryItemClick(item)}>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        )}
      </form>
      
      <div className="search-tips">
        <p>Try searching by: <span className="tag">language:javascript</span> <span className="tag">stars:{'>'}1000</span> <span className="tag">created:{'>'}2023-01-01</span></p>
      </div>
    </div>
  );
};

export default SearchBar; 