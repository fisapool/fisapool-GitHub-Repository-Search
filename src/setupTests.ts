// Import jest-dom matchers
import '@testing-library/jest-dom'; 

// Mock localStorage for tests
Object.defineProperty(window, 'localStorage', {
  value: {
    getItem: jest.fn<string | null, [string]>(),
    setItem: jest.fn<void, [string, string]>(),
    removeItem: jest.fn<void, [string]>(),
    clear: jest.fn<void, []>()
  }
}); 

// Set up global test environment
global.fetch = jest.fn(() => 
  Promise.resolve({
    json: () => Promise.resolve({}),
    ok: true
  }) as any
); 