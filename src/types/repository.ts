export interface Repository {
  id: number;
  name: string;
  full_name: string;
  owner: {
    login: string;
    avatar_url: string;
    html_url: string;
  };
  html_url: string;
  description: string;
  fork: boolean;
  created_at: string;
  updated_at: string;
  pushed_at: string;
  homepage: string;
  size: number;
  stargazers_count: number;
  watchers_count: number;
  language: string;
  forks_count: number;
  open_issues_count: number;
  default_branch: string;
  score: number;
  license?: {
    key: string;
    name: string;
    spdx_id: string;
    url: string;
  };
  topics?: string[];
} 