function RepositoryCard({ repository }) {
  const { 
    name, 
    stars, 
    forks, 
    description, 
    language, 
    author, 
    updatedAt 
  } = repository;
  
  return (
    <div className="repository-card">
      <h3 className="repo-name">{name}</h3>
      
      <div className="repo-stats">
        <span>{stars} ⭐</span>
        <span>{forks} 🍴</span>
      </div>
      
      {description && (
        <p className="repo-description">{description}</p>
      )}
      
      {/* Temporarily hide comparison checkbox */}
      {/* <div className="comparison-toggle">
        <input 
          type="checkbox" 
          id={`compare-${repository.id}`}
          className="repository-compare-checkbox"
        />
        <label htmlFor={`compare-${repository.id}`}>Compare</label>
      </div> */}
      
      <div className="repo-footer">
        {language && (
          <span className="repo-language">{language}</span>
        )}
        
        <div className="repo-author">
          by {author}
          <span className="repo-date">
            Updated {new Date(updatedAt).toLocaleDateString()}
          </span>
        </div>
      </div>
    </div>
  );
} 