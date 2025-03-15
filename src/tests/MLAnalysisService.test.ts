import { mlService } from '../services/mlAnalysisService';
import { cachingService } from '../services/cachingService';

// Mock TensorFlow.js
jest.mock('@tensorflow/tfjs', () => ({
  sequential: jest.fn(() => ({
    add: jest.fn(),
    compile: jest.fn(),
    fit: jest.fn().mockResolvedValue({}),
    predict: jest.fn().mockReturnValue({
      dataSync: jest.fn().mockReturnValue([0.75]),
      dispose: jest.fn()
    }),
    save: jest.fn().mockResolvedValue({}),
    getWeights: jest.fn().mockReturnValue([{
      arraySync: jest.fn().mockReturnValue([1, 2, 3])
    }])
  })),
  layers: {
    dense: jest.fn().mockReturnValue({})
  },
  tensor2d: jest.fn().mockReturnValue({
    dispose: jest.fn()
  }),
  train: {
    adam: jest.fn()
  }
}));

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

// Mock CryptoJS
jest.mock('crypto-js', () => ({
  AES: {
    encrypt: jest.fn().mockReturnValue({
      toString: jest.fn().mockReturnValue('encrypted-api-key')
    }),
    decrypt: jest.fn().mockReturnValue({
      toString: jest.fn().mockImplementation((format) => {
        if (format) return 'decrypted-api-key';
        return '';
      })
    })
  },
  enc: {
    Utf8: 'utf8'
  }
}));

// Sample repository data for testing
const mockRepositories = [
  {
    id: 1,
    full_name: 'test/repo1',
    readmeQualityScore: 75,
    hasCI: true,
    hasTests: true,
    featureCount: 10,
    issueResolutionRate: 80
  },
  {
    id: 2,
    full_name: 'test/repo2',
    readmeQualityScore: 50,
    hasCI: false,
    hasTests: false,
    featureCount: 5,
    issueResolutionRate: 40
  }
];

describe('MLAnalysisService', () => {
  // Clear mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.clear();
    cachingService.clear();
  });

  describe('Rate limiting', () => {
    test('should respect rate limits', async () => {
      // Set a low rate limit for testing
      const privateRateLimit = 3;
      Object.defineProperty(mlService, 'checkRateLimit', {
        value: function() {
          const now = Date.now();
          const oneMinuteAgo = now - 60000;
          
          // @ts-ignore - Accessing private property for testing
          this.requestTimestamps = this.requestTimestamps.filter(
            (timestamp: number) => timestamp > oneMinuteAgo
          );
          
          // @ts-ignore - Accessing private property for testing
          if (this.requestTimestamps.length >= privateRateLimit) {
            return false;
          }
          
          // @ts-ignore - Accessing private property for testing
          this.requestTimestamps.push(now);
          return true;
        }
      });
      
      // First set of requests should succeed
      await expect(mlService.generateInsights(mockRepositories)).resolves.toBeDefined();
      await expect(mlService.generateInsights(mockRepositories)).resolves.toBeDefined();
      await expect(mlService.generateInsights(mockRepositories)).resolves.toBeDefined();
      
      // Next request should be rate limited
      await expect(mlService.generateInsights(mockRepositories)).rejects.toThrow(/rate limit/i);
    });
  });

  describe('API key management', () => {
    test('should securely store and retrieve API keys', () => {
      const apiKey = 'test-api-key';
      const passphrase = 'test-passphrase';
      
      mlService.setApiKey(apiKey, passphrase);
      
      // Check that it was stored encrypted
      expect(localStorage.getItem('gh-repo-analyzer-api-key')).toBe('encrypted-api-key');
      
      // @ts-ignore - Testing private method
      const decrypted = mlService.getDecryptedApiKey(passphrase);
      expect(decrypted).toBe('decrypted-api-key');
    });
    
    test('should clear API keys on data clearing', () => {
      localStorage.setItem('gh-repo-analyzer-api-key', 'encrypted-api-key');
      
      mlService.clearAllStoredData();
      
      expect(localStorage.getItem('gh-repo-analyzer-api-key')).toBeNull();
    });
  });

  describe('Logging and auditing', () => {
    test('should log ML operations', async () => {
      await mlService.generateInsights(mockRepositories);
      
      // @ts-ignore - Accessing private property for testing
      const logs = mlService.getAnalysisLogs();
      
      expect(logs).toHaveLength(1);
      expect(logs[0]).toHaveProperty('operation', 'generate-insights');
      expect(logs[0]).toHaveProperty('repositoryCount', 2);
      expect(logs[0]).toHaveProperty('success', true);
    });
  });

  describe('Privacy controls', () => {
    test('should properly anonymize data when generating recommendations', async () => {
      const repository = mockRepositories[0];
      
      // @ts-ignore - Accessing private method for testing
      const recommendations = await mlService.generateQuantifiableRecommendations(repository);
      
      // Ensure no sensitive data is included
      recommendations.forEach(rec => {
        expect(rec).not.toHaveProperty('apiKey');
        expect(rec).not.toHaveProperty('token');
        expect(rec).not.toHaveProperty('password');
        expect(rec).not.toHaveProperty('secret');
      });
    });
  });
}); 