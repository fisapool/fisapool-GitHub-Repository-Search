// Environment configuration
interface EnvironmentConfig {
  apiUrl: string;
  mlServiceEnabled: boolean;
  cachingEnabled: boolean;
  debugMode: boolean;
  maxRepositoriesPerPage: number;
}

// Default configuration
const defaultConfig: EnvironmentConfig = {
  apiUrl: 'https://api.github.com',
  mlServiceEnabled: true,
  cachingEnabled: true,
  debugMode: false,
  maxRepositoriesPerPage: 10
};

// Environment-specific overrides
const environmentOverrides: Record<string, Partial<EnvironmentConfig>> = {
  development: {
    debugMode: true
  },
  test: {
    apiUrl: 'http://localhost:3000/mock-api',
    mlServiceEnabled: false
  },
  production: {
    debugMode: false
  }
};

// Determine the current environment
const getEnvironment = (): string => {
  return process.env.NODE_ENV || 'development';
};

// Create the configuration
const createConfig = (): EnvironmentConfig => {
  const environment = getEnvironment();
  const envConfig = environmentOverrides[environment] || {};
  
  return {
    ...defaultConfig,
    ...envConfig
  };
};

export const config = createConfig();
export default config; 