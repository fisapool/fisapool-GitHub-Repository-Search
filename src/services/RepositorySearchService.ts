import axios from 'axios';
import { mlService } from './mlAnalysisService';
import { cachingService } from './cachingService';

export class RepositorySearchService {
  private apiBaseUrl = 'https://api.github.com';
  
  async searchRepositories(query: string, options: {
    language?: string,
    stars?: number,
    topics?: string[]
  } = {}): Promise<any[]> {
    // Build GitHub search query with filters
    let searchQuery = query;
    if (options.language) searchQuery += ` language:${options.language}`;
    if (options.stars) searchQuery += ` stars:>=${options.stars}`;
    if (options.topics && options.topics.length > 0) {
      options.topics.forEach(topic => {
        searchQuery += ` topic:${topic}`;
      });
    }
    
    // Create a cache key based on the query and options
    const cacheKey = `search-${searchQuery}-${JSON.stringify(options)}`;
    
    // Check cache first
    const cachedResults = cachingService.get<any[]>(cacheKey, { 
      expirationTime: 5 * 60 * 1000, // 5 minutes
      useLocalStorage: true
    });
    
    if (cachedResults) {
      console.log('Using cached repository search results');
      return cachedResults;
    }
    
    // Not in cache, perform the API request
    console.log('Fetching fresh repository search results');
    
    try {
      // Fetch repositories matching the query
      const response = await axios.get(`${this.apiBaseUrl}/search/repositories`, {
        params: {
          q: searchQuery,
          sort: 'stars',
          order: 'desc',
          per_page: 10
        }
      });
      
      // Extract basic repository information
      const repositories = response.data.items;
      
      // Fetch detailed information for each repository
      const detailedRepositories = await Promise.all(
        repositories.map(async (repo: any) => {
          // Fetch README content
          let readme = null;
          try {
            const readmeResponse = await axios.get(
              `${this.apiBaseUrl}/repos/${repo.full_name}/readme`,
              { headers: { Accept: 'application/vnd.github.v3.raw' } }
            );
            readme = readmeResponse.data;
          } catch (error) {
            console.warn(`No README found for ${repo.full_name}`);
          }
          
          // Fetch languages used
          const languagesResponse = await axios.get(
            `${this.apiBaseUrl}/repos/${repo.full_name}/languages`
          );
          
          // Fetch issues to determine CI/CD setup and test coverage
          const issuesResponse = await axios.get(
            `${this.apiBaseUrl}/repos/${repo.full_name}/issues`,
            { params: { state: 'all', per_page: 20 } }
          );
          
          // Check if CI/CD is set up by looking for config files
          const hasCI = await this.checkForCIConfig(repo.full_name);
          
          // Check if repo has tests
          const hasTests = await this.checkForTests(repo.full_name);
          
          return {
            ...repo,
            readme,
            languages: languagesResponse.data,
            issues: issuesResponse.data,
            hasCI,
            hasTests,
            // Compute additional metrics
            readmeQualityScore: this.calculateReadmeQuality(readme),
            issueResolutionRate: this.calculateIssueResolutionRate(issuesResponse.data),
            updateFrequency: this.calculateUpdateFrequency(repo),
            featureCount: this.estimateFeatureCount(readme)
          };
        })
      );
      
      // Pre-analyze repositories with ML
      const results = await this.enhanceWithML(detailedRepositories);
      
      // Cache the results before returning
      cachingService.set(cacheKey, results, { 
        expirationTime: 5 * 60 * 1000, // 5 minutes
        useLocalStorage: true
      });
      
      return results;
    } catch (error) {
      console.error('Error searching repositories:', error);
      throw error;
    }
  }
  
  private calculateReadmeQuality(readme: string | null): number {
    if (!readme) return 0;
    
    // Basic metrics for README quality
    const wordCount = readme.split(/\s+/).length;
    const hasCodeExamples = (readme.match(/```/g) || []).length > 0;
    const hasSections = (readme.match(/#{2,}/g) || []).length > 0;
    const hasImages = (readme.match(/!\[.*?\]\(.*?\)/g) || []).length > 0;
    
    // Score calculation (0-100)
    let score = 0;
    if (wordCount > 500) score += 30;
    else if (wordCount > 200) score += 20;
    else if (wordCount > 100) score += 10;
    
    if (hasCodeExamples) score += 25;
    if (hasSections) score += 25;
    if (hasImages) score += 20;
    
    return Math.min(100, score);
  }
  
  // Other helper methods for calculating metrics
  private async checkForCIConfig(repoFullName: string): Promise<boolean> {
    // Check for common CI config files
    try {
      await axios.get(`${this.apiBaseUrl}/repos/${repoFullName}/contents/.github/workflows`);
      return true;
    } catch (e) {
      try {
        await axios.get(`${this.apiBaseUrl}/repos/${repoFullName}/contents/.travis.yml`);
        return true;
      } catch (e) {
        try {
          await axios.get(`${this.apiBaseUrl}/repos/${repoFullName}/contents/.circleci/config.yml`);
          return true;
        } catch (e) {
          return false;
        }
      }
    }
  }
  
  // More helper methods...
  
  private async enhanceWithML(repositories: any[]): Promise<any[]> {
    // Get ML predictions for all repositories
    const predictions = await mlService.generateInsights(repositories);
    
    // Combine predictions with repository data
    return repositories.map((repo, i) => ({
      ...repo,
      mlPrediction: predictions[i]
    }));
  }

  private async checkForTests(repoFullName: string): Promise<boolean> {
    try {
      // Look for common test directories and files
      const testPaths = [
        '/test',
        '/tests',
        '/spec',
        '/jest.config.js',
        '/cypress.json'
      ];
      
      for (const path of testPaths) {
        try {
          await axios.get(`${this.apiBaseUrl}/repos/${repoFullName}/contents${path}`);
          return true;
        } catch (err) {
          // Continue checking other paths
        }
      }
      
      return false;
    } catch (error) {
      console.error('Error checking for tests:', error);
      return false;
    }
  }

  private calculateIssueResolutionRate(issues: any[]): number {
    if (!issues || issues.length === 0) return 0;
    
    const closedIssues = issues.filter(issue => issue.state === 'closed');
    return Math.round((closedIssues.length / issues.length) * 100);
  }

  private calculateUpdateFrequency(repo: any): string {
    if (!repo || !repo.pushed_at) return 'unknown';
    
    const lastPushDate = new Date(repo.pushed_at);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - lastPushDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays < 7) return 'very active';
    if (diffDays < 30) return 'active';
    if (diffDays < 90) return 'moderate';
    if (diffDays < 365) return 'sporadic';
    return 'inactive';
  }

  private estimateFeatureCount(readme: string | null): number {
    if (!readme) return 0;
    
    // Count headings in markdown that might indicate features
    const headingMatches = readme.match(/#{2,4}\s+[A-Za-z][^#]+/g) || [];
    
    // Count bullet points that might be features
    const bulletMatches = readme.match(/[-*]\s+[A-Z][^\n]+/g) || [];
    
    // Analyze code blocks for potential API endpoints or commands
    const codeBlockMatches = readme.match(/```[\s\S]+?```/g) || [];
    
    // Weight different indicators
    return Math.min(50, 
      Math.floor(headingMatches.length * 0.8) + 
      Math.floor(bulletMatches.length * 0.3) + 
      Math.floor(codeBlockMatches.length * 0.5)
    );
  }
} 