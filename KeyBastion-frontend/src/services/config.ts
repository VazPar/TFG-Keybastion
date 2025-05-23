/**
 * Configuration service for the KeyBastion frontend application
 * Manages environment variables and application settings
 */

// Determine the environment
// Removed unused isDevelopment variable
const isProduction = import.meta.env.PROD || false;

// API base URL from environment variables
// In production, this will use relative URLs which work regardless of deployment domain
// For development with Vite proxy, use empty string to make relative requests
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

// Application information
export const APP_NAME = import.meta.env.VITE_APP_NAME || 'KeyBastion';
export const APP_VERSION = import.meta.env.VITE_APP_VERSION || '0.1.0';

// API endpoints
export const API_ENDPOINTS = {
  // Auth endpoints
  AUTH: {
    LOGIN: `${API_BASE_URL}/api/auth/login`,
    REGISTER: `${API_BASE_URL}/api/auth/register`,
    REFRESH: `${API_BASE_URL}/api/auth/refresh`,
    LOGOUT: `${API_BASE_URL}/api/auth/logout`,
  },
  // User endpoints
  USER: {
    PROFILE: `${API_BASE_URL}/api/users/profile`,
    SETTINGS: `${API_BASE_URL}/api/users/settings`,
  },
  // Credential endpoints
  CREDENTIALS: {
    BASE: `${API_BASE_URL}/api/credentials`,
    BY_ID: (id: string) => `${API_BASE_URL}/api/credentials/${id}`,
    BY_CATEGORY: (categoryId: string) => `${API_BASE_URL}/api/credentials/category/${categoryId}`,
  },
  // Category endpoints
  CATEGORIES: {
    BASE: `${API_BASE_URL}/api/categories`,
    BY_ID: (id: string) => `${API_BASE_URL}/api/categories/${id}`,
  },
  // Password generation and evaluation
  PASSWORDS: {
    GENERATE: `${API_BASE_URL}/api/passwords/generate`,
    EVALUATE: `${API_BASE_URL}/api/passwords/evaluate`,
  },
  // Sharing endpoints
  SHARING: {
    BASE: `${API_BASE_URL}/api/sharing`,
    BY_ID: (id: string) => `${API_BASE_URL}/api/sharing/${id}`,
  },
  // Admin endpoints
  ADMIN: {
    USERS: `${API_BASE_URL}/api/admin/users`,
    ACTIVITY_LOGS: `${API_BASE_URL}/api/admin/logs`,
    STATS_CATEGORY: `${API_BASE_URL}/api/admin/stats/categories`,
    STATS_SHARING: `${API_BASE_URL}/api/admin/stats/sharing`,
    CATEGORIES: `${API_BASE_URL}/api/admin/categories`,
  },
};

// Default request timeout in milliseconds
export const DEFAULT_TIMEOUT = isProduction ? 15000 : 10000;

// Local storage keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'keybastion_auth_token',
  REFRESH_TOKEN: 'keybastion_refresh_token',
  USER_INFO: 'keybastion_user_info',
  THEME: 'keybastion_theme',
  LANGUAGE: 'keybastion_language',
};

// Application theme options
export const THEMES = {
  LIGHT: 'light',
  DARK: 'dark',
  SYSTEM: 'system',
};

// Default application settings
export const DEFAULT_SETTINGS = {
  theme: THEMES.SYSTEM,
  language: 'en',
  autoLogout: isProduction ? 30 : 15, // minutes
  showPasswordStrength: true,
};
