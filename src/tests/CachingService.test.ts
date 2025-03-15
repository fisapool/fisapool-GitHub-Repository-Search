import { cachingService, CachingService } from '../services/cachingService';

// Mock localStorage
const localStorageMock = (function() {
  let store: Record<string, string> = {};
  return {
    getItem: function(key: string) {
      return store[key] || null;
    },
    setItem: function(key: string, value: string) {
      store[key] = value.toString();
    },
    removeItem: function(key: string) {
      delete store[key];
    },
    clear: function() {
      store = {};
    },
    get length() {
      return Object.keys(store).length;
    },
    key: function(i: number) {
      return Object.keys(store)[i] || null;
    }
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

describe('CachingService', () => {
  let cachingService: CachingService;
  
  beforeEach(() => {
    cachingService = new CachingService();
    localStorageMock.clear();
    jest.useFakeTimers();
  });
  
  afterEach(() => {
    jest.useRealTimers();
  });
  
  test('should store and retrieve items from memory cache', () => {
    const testData = { name: 'test', value: 123 };
    
    cachingService.set('test-key', testData);
    
    const retrieved = cachingService.get('test-key');
    
    expect(retrieved).toEqual(testData);
  });
  
  test('should store and retrieve items from localStorage', () => {
    const testData = { name: 'test', value: 123 };
    
    cachingService.set('test-key', testData, { useLocalStorage: true });
    
    // Verify it's in localStorage
    expect(localStorage.getItem('github-analyzer-test-key')).toBeTruthy();
    
    const retrieved = cachingService.get('test-key', { useLocalStorage: true });
    
    expect(retrieved).toEqual(testData);
  });
  
  test('should respect expiration time', () => {
    const testData = { name: 'test', value: 123 };
    
    cachingService.set('test-key', testData, { expirationTime: 1000 }); // 1 second
    
    // Item should be available before expiration
    expect(cachingService.get('test-key')).toEqual(testData);
    
    // Fast-forward time to after expiration
    jest.advanceTimersByTime(1100);
    
    // Item should be gone now
    expect(cachingService.get('test-key')).toBeNull();
  });
  
  test('should invalidate specific cache entries', () => {
    cachingService.set('key1', 'value1');
    cachingService.set('key2', 'value2');
    
    expect(cachingService.get('key1')).toBe('value1');
    expect(cachingService.get('key2')).toBe('value2');
    
    cachingService.invalidate('key1');
    
    expect(cachingService.get('key1')).toBeNull();
    expect(cachingService.get('key2')).toBe('value2');
  });
  
  test('should clear all cache entries', () => {
    cachingService.set('key1', 'value1');
    cachingService.set('key2', 'value2', { useLocalStorage: true });
    
    expect(cachingService.get('key1')).toBe('value1');
    expect(cachingService.get('key2', { useLocalStorage: true })).toBe('value2');
    
    cachingService.clear();
    
    expect(cachingService.get('key1')).toBeNull();
    expect(cachingService.get('key2', { useLocalStorage: true })).toBeNull();
  });
}); 