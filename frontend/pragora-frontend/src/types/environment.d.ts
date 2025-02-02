/// <reference types="react-scripts" />

interface Window {
  fs: {
    readFile(path: string, options?: { encoding?: string }): Promise<string | Uint8Array>;
  };
}

declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV: 'development' | 'production' | 'test';
    REACT_APP_API_URL: string;
    REACT_APP_API_BASE_URL: string;  // Added for your base API URL
    REACT_APP_AUTH_URL: string;      // Added for auth endpoints
    // Add other environment variables you might need
  }
}