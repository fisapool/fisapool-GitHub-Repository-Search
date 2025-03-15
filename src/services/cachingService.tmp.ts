// A simple cache service for API responses and ML analysis results
export {};

interface CacheItem<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

export interface CacheOptions {
  /** Cache expiration time in milliseconds */
  expirationTime?: number;
  /** Cache key prefix to avoid collisions */
  keyPrefix?: string;
  /** Whether to use localStorage (persistent) or memory (session) caching */
  useLocalStorage?: boolean;
}

export class CachingService {
  private memoryCache: Map<string, CacheItem<any>> = new Map();
  private defaultExpirationTime = 15 * 60 * 1000; // 15 minutes
  private defaultKeyPrefix = 'github-analyzer-';

  /**
   * Gets data from cache if available and not expired
   */
  public get<T>(key: string, options?: CacheOptions): T | null {
    const fullKey = this.getFullKey(key, options?.keyPrefix);
    const useLocalStorage = options?.useLocalStorage ?? false;

    if (useLocalStorage) {
      return this.getFromLocalStorage<T>(fullKey);
    } else {
      return this.getFromMemory<T>(fullKey);
    }
  }

  /**
   * Stores data in the cache
   */
  public set<T>(key: string, data: T, options?: CacheOptions): void {
    const fullKey = this.getFullKey(key, options?.keyPrefix);
    const expirationTime = options?.expirationTime ?? this.defaultExpirationTime;
    const useLocalStorage = options?.useLocalStorage ?? false;

    const now = Date.now();
    const cacheItem: CacheItem<T> = {
      data,
      timestamp: now,
      expiresAt: now + expirationTime
    };

    if (useLocalStorage) {
      this.setInLocalStorage(fullKey, cacheItem);
    } else {
      this.setInMemory(fullKey, cacheItem);
    }
  }

  /**
   * Invalidates a specific cache entry
   */
  public invalidate(key: string, options?: CacheOptions): void {
    const fullKey = this.getFullKey(key, options?.keyPrefix);
    const useLocalStorage = options?.useLocalStorage ?? false;

    if (useLocalStorage) {
      localStorage.removeItem(fullKey);
    }
    
    this.memoryCache.delete(fullKey);
  }

  /**
   * Clears all cache entries with the provided prefix (or default prefix)
   */
  public clear(prefix: string = this.defaultKeyPrefix): void {
    // Clear localStorage items
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const key = localStorage.key(i);
      if (key && key.startsWith(prefix)) {
        localStorage.removeItem(key);
      }
    }
    
    // Clear memory cache using Array.from to convert iterator to array
    Array.from(this.memoryCache.keys()).forEach(key => {
      if (key.startsWith(prefix)) {
        this.memoryCache.delete(key);
      }
    });
  }

  private getFullKey(key: string, prefix?: string): string {
    return `${prefix ?? this.defaultKeyPrefix}${key}`;
  }

  private getFromMemory<T>(fullKey: string): T | null {
    const item = this.memoryCache.get(fullKey);
    
    if (!item) return null;
    
    if (Date.now() > item.expiresAt) {
      this.memoryCache.delete(fullKey);
      return null;
    }
    
    return item.data as T;
  }

  private getFromLocalStorage<T>(fullKey: string): T | null {
    const itemJson = localStorage.getItem(fullKey);
    
    if (!itemJson) return null;
    
    try {
      const item = JSON.parse(itemJson) as CacheItem<T>;
      
      if (Date.now() > item.expiresAt) {
        localStorage.removeItem(fullKey);
        return null;
      }
      
      return item.data;
    } catch (error) {
      console.error('Error parsing cached data:', error);
      localStorage.removeItem(fullKey);
      return null;
    }
  }

  private setInMemory<T>(fullKey: string, item: CacheItem<T>): void {
    // Clean up expired items occasionally to prevent memory leaks
    if (Math.random() < 0.1) { // 10% chance to clean up on each set
      this.cleanupExpiredMemoryCache();
    }
    
    this.memoryCache.set(fullKey, item);
  }

  private setInLocalStorage<T>(fullKey: string, item: CacheItem<T>): void {
    try {
      const itemJson = JSON.stringify(item);
      localStorage.setItem(fullKey, itemJson);
    } catch (error) {
      console.error('Error caching data in localStorage:', error);
      
      // If storage is full, clear older items
      if (error instanceof DOMException && error.name === 'QuotaExceededError') {
        this.clearOldestLocalStorageItems();
        
        // Try again
        try {
          const itemJson = JSON.stringify(item);
          localStorage.setItem(fullKey, itemJson);
        } catch {
          console.error('Still unable to cache data after clearing old items');
        }
      }
    }
  }

  private cleanupExpiredMemoryCache(): void {
    const now = Date.now();
    Array.from(this.memoryCache.entries()).forEach(([key, item]) => {
      if (now > item.expiresAt) {
        this.memoryCache.delete(key);
      }
    });
  }

  private clearOldestLocalStorageItems(): void {
    const prefix = this.defaultKeyPrefix;
    const items: { key: string; timestamp: number }[] = [];
    
    // Collect all cache items with their timestamps
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(prefix)) {
        try {
          const value = localStorage.getItem(key);
          if (value) {
            const item = JSON.parse(value) as CacheItem<any>;
            items.push({ key, timestamp: item.timestamp });
          }
        } catch {
          // If we can't parse it, it's safe to remove
          localStorage.removeItem(key);
        }
      }
    }
    
    // Sort by timestamp (oldest first) and remove oldest 25%
    items.sort((a, b) => a.timestamp - b.timestamp);
    const itemsToRemove = Math.ceil(items.length * 0.25);
    
    for (let i = 0; i < itemsToRemove; i++) {
      if (items[i]) {
        localStorage.removeItem(items[i].key);
      }
    }
  }
}

export const cachingService = new CachingService(); 