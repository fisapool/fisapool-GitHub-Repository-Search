import React from 'react';

export interface Issue {
  id: number;
  title: string;
  html_url: string;
  state: string;
  user: {
    login: string;
    avatar_url: string;
  };
  created_at: string;
}

interface IssueListProps {
  issues: Issue[];
}

const IssueList: React.FC<IssueListProps> = ({ issues }) => {
  return (
    <div className="issue-list">
      <h2>Issues</h2>
      {issues.length === 0 ? (
        <p>No issues found</p>
      ) : (
        <ul>
          {issues.map((issue) => (
            <li key={issue.id}>
              <h3>{issue.title}</h3>
              <div>
                <span>Status: {issue.state}</span>
                <span>Created by: {issue.user.login}</span>
                <span>Created on: {new Date(issue.created_at).toLocaleDateString()}</span>
              </div>
              <a href={issue.html_url} target="_blank" rel="noopener noreferrer">
                View on GitHub
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default IssueList; 