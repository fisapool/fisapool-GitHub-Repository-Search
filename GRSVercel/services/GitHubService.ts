// GitHubService.ts
export interface Repository {
  id: number
  name: string
  full_name: string
  description: string
  html_url: string
  stargazers_count: number
  forks_count: number
  language: string
  topics: string[]
  license?: {
    key: string
    name: string
  }
  updated_at: string
  created_at: string
  owner: {
    login: string
    avatar_url: string
  }
}

export interface SearchOptions {
  language?: string
  minStars?: number
  updatedAfter?: string
  topic?: string
  searchInName?: boolean
  searchInDescription?: boolean
  searchInReadme?: boolean
  perPage?: number
  page?: number
}

export class GitHubService {
  // Store the timestamp of the last request to implement rate limiting
  private static lastRequestTime = 0
  private static requestQueue: Array<() => Promise<any>> = []
  private static isProcessingQueue = false
  private static rateLimitRemaining = 60 // Default GitHub rate limit for unauthenticated requests
  private static rateLimitReset = 0

  // Add a method to get a GitHub token from localStorage or environment
  private static getAuthToken(): string | null {
    // Try to get from localStorage first (client-side)
    if (typeof window !== "undefined") {
      return localStorage.getItem("github_token")
    }
    // For server-side, could use environment variables
    return process.env.GITHUB_TOKEN || null
  }

  // Add a method to save a GitHub token to localStorage
  public static saveAuthToken(token: string): void {
    if (typeof window !== "undefined") {
      localStorage.setItem("github_token", token)
    }
  }

  // Add a method to clear the GitHub token
  public static clearAuthToken(): void {
    if (typeof window !== "undefined") {
      localStorage.removeItem("github_token")
    }
  }

  // Add a method to check if we're authenticated
  public static isAuthenticated(): boolean {
    return !!this.getAuthToken()
  }

  // Add a method to handle rate limiting
  private static async executeWithRateLimit<T>(requestFn: () => Promise<T>): Promise<T> {
    // Add request to queue
    return new Promise<T>((resolve, reject) => {
      this.requestQueue.push(async () => {
        try {
          const result = await requestFn()
          resolve(result)
          return result
        } catch (error) {
          reject(error)
          throw error
        }
      })

      // Start processing the queue if not already processing
      if (!this.isProcessingQueue) {
        this.processQueue()
      }
    })
  }

  // Process the request queue with rate limiting
  private static async processQueue() {
    if (this.requestQueue.length === 0) {
      this.isProcessingQueue = false
      return
    }

    this.isProcessingQueue = true

    // Calculate time to wait before next request
    const now = Date.now()
    let timeToWait = 0

    // If we're close to rate limit, wait until reset
    if (this.rateLimitRemaining <= 5 && this.rateLimitReset > now) {
      timeToWait = Math.max(0, this.rateLimitReset - now + 1000) // Add 1 second buffer
    } else {
      // Otherwise, ensure at least 100ms between requests to be gentle
      timeToWait = Math.max(0, this.lastRequestTime + 100 - now)
    }

    if (timeToWait > 0) {
      await new Promise((resolve) => setTimeout(resolve, timeToWait))
    }

    // Execute the next request
    const nextRequest = this.requestQueue.shift()
    if (nextRequest) {
      this.lastRequestTime = Date.now()
      try {
        await nextRequest()
      } catch (error) {
        console.error("Error processing queued request:", error)
      }
    }

    // Continue processing the queue
    this.processQueue()
  }

  // Update headers with authentication if available
  private static getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      Accept: "application/vnd.github.v3+json",
    }

    const token = this.getAuthToken()
    if (token) {
      headers["Authorization"] = `token ${token}`
    }

    return headers
  }

  // Update to parse rate limit headers from response
  private static updateRateLimits(response: Response) {
    const remaining = response.headers.get("X-RateLimit-Remaining")
    const reset = response.headers.get("X-RateLimit-Reset")

    if (remaining) {
      this.rateLimitRemaining = Number.parseInt(remaining, 10)
    }

    if (reset) {
      // Convert from seconds to milliseconds
      this.rateLimitReset = Number.parseInt(reset, 10) * 1000
    }
  }

  static async searchRepositories(
    query: string,
    options: SearchOptions = {},
  ): Promise<{ items: Repository[]; totalCount: number }> {
    if (!query.trim()) {
      return { items: [], totalCount: 0 }
    }

    // Build the query with advanced search operators
    let searchQuery = query

    // Add language filter
    if (options.language) {
      searchQuery += ` language:${options.language}`
    }

    // Add star count filter
    if (options.minStars) {
      searchQuery += ` stars:>=${options.minStars}`
    }

    // Add date filter
    if (options.updatedAfter) {
      searchQuery += ` pushed:>${options.updatedAfter}`
    }

    // Add topic filter
    if (options.topic) {
      searchQuery += ` topic:${options.topic}`
    }

    // Add search scope
    if (options.searchInName) {
      searchQuery += " in:name"
    }
    if (options.searchInDescription) {
      searchQuery += " in:description"
    }
    if (options.searchInReadme) {
      searchQuery += " in:readme"
    }

    // Set pagination
    const perPage = options.perPage || 30
    const page = options.page || 1

    return this.executeWithRateLimit(async () => {
      try {
        const url = new URL("https://api.github.com/search/repositories")
        url.searchParams.append("q", searchQuery)
        url.searchParams.append("sort", "stars")
        url.searchParams.append("order", "desc")
        url.searchParams.append("per_page", perPage.toString())
        url.searchParams.append("page", page.toString())

        console.log("Searching with query:", searchQuery)
        console.log("Full URL:", url.toString())

        const response = await fetch(url.toString(), {
          headers: this.getHeaders(),
        })

        // Update rate limit information
        this.updateRateLimits(response)

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(`GitHub API error: ${response.status} - ${JSON.stringify(errorData)}`)
        }

        const data = await response.json()
        return {
          items: data.items || [],
          totalCount: data.total_count || 0,
        }
      } catch (error) {
        console.error("Error searching repositories:", error)
        throw error
      }
    })
  }

  static async getRepositoryById(id: string): Promise<Repository | null> {
    return this.executeWithRateLimit(async () => {
      try {
        const response = await fetch(`https://api.github.com/repositories/${id}`, {
          headers: this.getHeaders(),
        })

        // Update rate limit information
        this.updateRateLimits(response)

        if (!response.ok) {
          throw new Error(`GitHub API error: ${response.status}`)
        }

        return await response.json()
      } catch (error) {
        console.error("Error fetching repository:", error)
        return null
      }
    })
  }
}

