// A simple cache service for API responses and ML analysis results
export {};

interface CacheItem<T> {
  value: T;
  expiry: number;
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
   * Stores data in cache with expiration
   */
  public set<T>(key: string, value: T, options?: CacheOptions): void {
    const fullKey = this.getFullKey(key, options?.keyPrefix);
    const expirationTime = options?.expirationTime ?? this.defaultExpirationTime;
    const useLocalStorage = options?.useLocalStorage ?? false;
    
    const now = Date.now();
    const item: CacheItem<T> = {
      value,
      expiry: now + expirationTime
    };
    
    if (useLocalStorage) {
      this.setToLocalStorage(fullKey, item);
    } else {
      this.setToMemory(fullKey, item);
    }
  }
  
  /**
   * Removes a specific item from cache
   */
  public invalidate(key: string, options?: CacheOptions): void {
    const fullKey = this.getFullKey(key, options?.keyPrefix);
    const useLocalStorage = options?.useLocalStorage ?? false;
    
    if (useLocalStorage) {
      localStorage.removeItem(fullKey);
    } else {
      this.memoryCache.delete(fullKey);
    }
  }
  
  /**
   * Clears all cached items or only those with a specific prefix
   */
  public clear(keyPrefix?: string): void {
    // Clear memory cache
    if (keyPrefix) {
      // Only clear items with the specified prefix
      const keysToDelete: string[] = [];
      this.memoryCache.forEach((_, key) => {
        if (key.startsWith(keyPrefix)) {
          keysToDelete.push(key);
        }
      });
      keysToDelete.forEach(key => this.memoryCache.delete(key));
    } else {
      // Clear all items
      this.memoryCache.clear();
    }
    
    // Clear localStorage cache
    const prefix = keyPrefix || this.defaultKeyPrefix;
    const keysToRemove: string[] = [];
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(prefix)) {
        keysToRemove.push(key);
      }
    }
    
    // Remove items in a separate loop to avoid index shifting during removal
    keysToRemove.forEach(key => localStorage.removeItem(key));
  }
  
  private getFullKey(key: string, keyPrefix?: string): string {
    const prefix = keyPrefix ?? this.defaultKeyPrefix;
    return `${prefix}${key}`;
  }
  
  private getFromMemory<T>(fullKey: string): T | null {
    const item = this.memoryCache.get(fullKey);
    
    if (!item) return null;
    
    if (Date.now() > item.expiry) {
      this.memoryCache.delete(fullKey);
      return null;
    }
    
    return item.value as T;
  }

  private getFromLocalStorage<T>(fullKey: string): T | null {
    const itemStr = localStorage.getItem(fullKey);
    
    if (!itemStr) return null;
    
    try {
      const item: CacheItem<T> = JSON.parse(itemStr);
      
      if (item.expiry && item.expiry < Date.now()) {
        localStorage.removeItem(fullKey);
        return null;
      }
      
      return item.value;
    } catch (error) {
      console.error('Error retrieving cached item:', error);
      return null;
    }
  }
  
  private setToMemory<T>(fullKey: string, item: CacheItem<T>): void {
    this.memoryCache.set(fullKey, item);
  }
  
  private setToLocalStorage<T>(fullKey: string, item: CacheItem<T>): void {
    try {
      localStorage.setItem(fullKey, JSON.stringify(item));
    } catch (error) {
      console.error('Error caching item to localStorage:', error);
    }
  }
  
  // Additional compatibility methods for the older code
  public getItem<T>(key: string): T | null {
    try {
      const item = localStorage.getItem(key);
      if (!item) return null;
      
      const parsedItem = JSON.parse(item) as CacheItem<T>;
      
      // Check if the item has expired
      if (parsedItem.expiry && parsedItem.expiry < Date.now()) {
        localStorage.removeItem(key);
        return null;
      }
      
      return parsedItem.value;
    } catch (error) {
      console.error('Error retrieving cached item:', error);
      return null;
    }
  }
  
  public setItem<T>(key: string, value: T, expirationTimeMs: number = 3600000): void {
    try {
      const now = Date.now();
      const cacheItem: CacheItem<T> = {
        value: value,
        expiry: now + expirationTimeMs
      };
      
      localStorage.setItem(key, JSON.stringify(cacheItem));
    } catch (error) {
      console.error('Error caching item:', error);
    }
  }
}

export const cachingService = new CachingService();
export default CachingService; 