// Import necessary modules
import axios, { AxiosError, AxiosResponse } from 'axios';
import { Repository } from '../types/repository';
import { cachingService } from './cachingService';

// Constants
const GITHUB_API_BASE_URL = process.env.REACT_APP_GITHUB_API_URL || 'https://api.github.com';
const DEFAULT_RETRY_DELAY = parseInt(process.env.REACT_APP_RETRY_DELAY || '1000');
const MAX_RETRIES = parseInt(process.env.REACT_APP_MAX_RETRIES || '3');
const RATE_LIMIT_THRESHOLD = parseInt(process.env.REACT_APP_RATE_LIMIT_THRESHOLD || '10');
// const CACHE_EXPIRY_MS = 60 * 60 * 1000; // 1 hour

// Types
export interface RepositorySearchResult {
  total_count: number;
  incomplete_results: boolean;
  items: Repository[];
}

export interface RateLimitInfo {
  limit: number;
  remaining: number;
  reset: number; // Unix timestamp
  used: number;
}

// interface RequestOptions {
//   useCache?: boolean;
//   cacheKey?: string;
// }

export class GitHubService {
  private apiBaseUrl: string;
  private token?: string;
  private rateLimitInfo: RateLimitInfo | null = null;
  private requestQueue: Array<() => Promise<any>> = [];
  private processingQueue = false;
  private requestThrottleMs = 100; // Minimum time between requests

  constructor(token?: string) {
    this.apiBaseUrl = GITHUB_API_BASE_URL;
    this.token = token;
    
    // Initialize token from localStorage if available
    if (!token) {
      const savedToken = localStorage.getItem('github_token');
      if (savedToken) {
        this.token = savedToken;
      }
    }
  }
  
  setToken(token: string) {
    this.token = token;
    localStorage.setItem('github_token', token);
  }
  
  clearToken() {
    this.token = undefined;
    localStorage.removeItem('github_token');
  }

  /**
   * Get the current rate limit information
   */
  getRateLimitInfo(): RateLimitInfo | null {
    return this.rateLimitInfo;
  }

  /**
   * Checks if we're close to hitting the rate limit
   */
  isRateLimitNearlyReached(): boolean {
    if (!this.rateLimitInfo) return false;
    return this.rateLimitInfo.remaining < RATE_LIMIT_THRESHOLD;
  }

  /**
   * Calculate time to wait before reset
   */
  getTimeToRateLimitReset(): number {
    if (!this.rateLimitInfo) return 0;
    const resetTime = this.rateLimitInfo.reset * 1000; // Convert to ms
    const now = Date.now();
    return Math.max(0, resetTime - now);
  }

  /**
   * Process requests in a queue to manage rate limits
   */
  private async processQueue() {
    if (this.processingQueue || this.requestQueue.length === 0) return;
    
    this.processingQueue = true;
    
    while (this.requestQueue.length > 0) {
      // Check if we're rate limited
      if (this.isRateLimitNearlyReached()) {
        const waitTime = this.getTimeToRateLimitReset() + 1000; // Add 1s buffer
        console.log(`Rate limit nearly reached. Waiting ${waitTime/1000}s before continuing.`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
      
      const request = this.requestQueue.shift();
      if (request) {
        try {
          await request();
        } catch (error) {
          console.error('Error processing queued request:', error);
        }
        
        // Add delay between requests
        await new Promise(resolve => setTimeout(resolve, this.requestThrottleMs));
      }
    }
    
    this.processingQueue = false;
  }

  /**
   * Queue a request to be processed with rate limiting
   */
  private queueRequest<T>(requestFn: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.requestQueue.push(async () => {
        try {
          const result = await requestFn();
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });
      
      // Start processing the queue if it's not already running
      this.processQueue();
    });
  }

  /**
   * Make an API request with retries and rate limit handling
   */
  private async makeRequest<T>(
    url: string, 
    options?: { 
      method?: string, 
      params?: any, 
      data?: any,
      retryCount?: number
    }
  ): Promise<T> {
    const { 
      method = 'GET', 
      params = {}, 
      data = null,
      retryCount = 0 
    } = options || {};
    
    try {
      const response = await axios({
        method,
        url: `${this.apiBaseUrl}${url}`,
        params,
        data,
        headers: {
          'Accept': 'application/vnd.github.v3+json',
          ...(this.token ? { 'Authorization': `token ${this.token}` } : {})
        }
      });
      
      // Update rate limit info from headers
      this.updateRateLimitFromResponse(response);
      
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError;
        
        // Update rate limit info from error response if available
        if (axiosError.response) {
          this.updateRateLimitFromResponse(axiosError.response);
        }
        
        // Handle rate limiting (429 Too Many Requests)
        if (axiosError.response?.status === 429) {
          if (retryCount < MAX_RETRIES) {
            // Get retry delay from response headers or use default
            const retryAfter = axiosError.response.headers['retry-after'];
            const delayMs = retryAfter ? parseInt(retryAfter) * 1000 : DEFAULT_RETRY_DELAY * Math.pow(2, retryCount);
            
            console.log(`Rate limited. Retrying after ${delayMs/1000}s...`);
            await new Promise(resolve => setTimeout(resolve, delayMs));
            
            // Retry the request
            return this.makeRequest(url, { 
              method, 
              params, 
              data,
              retryCount: retryCount + 1 
            });
          } else {
            throw new Error(`GitHub API rate limit exceeded. Try again later or provide an authentication token.`);
          }
        }
        
        // Handle other errors - add this type assertion
        const errorData = axiosError.response?.data as any;
        const message = errorData?.message || axiosError.message;
        throw new Error(`GitHub API error: ${message}`);
      }
      
      throw error;
    }
  }
  
  /**
   * Update rate limit information from response headers
   */
  private updateRateLimitFromResponse(response: AxiosResponse) {
    const limit = response.headers['x-ratelimit-limit'];
    const remaining = response.headers['x-ratelimit-remaining'];
    const reset = response.headers['x-ratelimit-reset'];
    const used = response.headers['x-ratelimit-used'];
    
    if (limit && remaining && reset) {
      this.rateLimitInfo = {
        limit: parseInt(limit),
        remaining: parseInt(remaining),
        reset: parseInt(reset),
        used: used ? parseInt(used) : 0
      };
      
      console.log(`GitHub API Rate Limit: ${this.rateLimitInfo.remaining}/${this.rateLimitInfo.limit}`);
    }
  }
  
  /**
   * Search for repositories based on the given query with advanced filtering
   */
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
    const cachedResults = cachingService.getItem<any[]>(cacheKey);
    
    if (cachedResults) {
      console.log('Using cached repository search results');
      return cachedResults;
    }
    
    // Not in cache, perform the API request
    console.log('Fetching fresh repository search results');
    
    return this.queueRequest(async () => {
      try {
        const data = await this.makeRequest<any>('/search/repositories', {
          params: {
            q: searchQuery,
            sort: 'stars',
            order: 'desc',
            per_page: 10
          }
        });
        
        // Extract basic repository information
        const repositories = data.items;
        
        // Cache the results
        cachingService.setItem(cacheKey, repositories, 5 * 60 * 1000); // 5 minutes
        
        return repositories;
      } catch (error) {
        console.error('Error searching repositories:', error);
        return [];
      }
    });
  }
  
  /**
   * Get detailed information about a specific repository
   */
  async getRepository(owner: string, repo: string): Promise<any | null> {
    const cacheKey = `repo-${owner}-${repo}`;
    
    // Check cache first
    const cachedRepo = cachingService.getItem<any>(cacheKey);
    
    if (cachedRepo) {
      console.log('Using cached repository data');
      return cachedRepo;
    }
    
    return this.queueRequest(async () => {
      try {
        const repository = await this.makeRequest<any>(`/repos/${owner}/${repo}`);
        
        // Cache the results
        cachingService.setItem(cacheKey, repository, 60 * 60 * 1000); // 1 hour
        
        return repository;
      } catch (error) {
        console.error(`Error fetching repository ${owner}/${repo}:`, error);
        return null;
      }
    });
  }

  /**
   * Search for repositories based on the given query
   */
  async getRepositories(query: string): Promise<RepositorySearchResult> {
    const cacheKey = `search-${query}`;
    
    // Check cache first
    const cachedResults = cachingService.get<RepositorySearchResult>(cacheKey, { 
      expirationTime: 5 * 60 * 1000, // 5 minutes
      useLocalStorage: true
    });
    
    if (cachedResults) {
      console.log('Using cached repository search results');
      return cachedResults;
    }
    
    return this.queueRequest(async () => {
      try {
        const result = await this.makeRequest<RepositorySearchResult>('/search/repositories', {
          params: {
            q: query,
            sort: 'stars',
            order: 'desc'
          }
        });
        
        // Cache the results
        cachingService.set(cacheKey, result, { 
          expirationTime: 5 * 60 * 1000, // 5 minutes
          useLocalStorage: true 
        });
        
        return result;
      } catch (error) {
        console.error('Error searching repositories:', error);
        return { total_count: 0, incomplete_results: false, items: [] };
      }
    });
  }
}

export const githubService = new GitHubService();
export default GitHubService; 