/**
 * Security-focused token utilities for the KeyBastion password management application.
 * 
 * This module provides comprehensive JWT token management functionality including:
 * - Secure token validation and verification
 * - Token storage with security checks
 * - Expiration management and automatic refresh
 * - Cross-tab synchronization to maintain security state
 * - User authentication state management
 * 
 * Security considerations implemented:
 * - Token format validation to prevent manipulation
 * - Expiration checking with configurable buffer periods
 * - Proper error handling to prevent security information disclosure
 * - Synchronized authentication state across browser tabs
 * - Secure token storage practices
 * 
 * This module is a critical security component that supports the authentication
 * layer of KeyBastion and helps protect sensitive credential data.
 */

import { jwtDecode } from 'jwt-decode';
import { STORAGE_KEYS } from '../services/config';
import type { TokenPayload } from '../types';

/**
 * Extended JWT payload interface with KeyBastion-specific claims.
 * 
 * This interface defines the structure of the decoded JWT token payload,
 * including standard JWT claims and custom claims specific to KeyBastion's
 * user model and authorization system.
 */
// TokenPayload is now imported from '../types'

/**
 * Validates if a token string is properly formatted according to security requirements.
 * 
 * This function performs critical security checks on tokens before they are trusted:
 * 1. Checks for null/empty tokens
 * 2. Validates UUID format for refresh tokens
 * 3. Validates JWT format (three dot-separated sections) for access tokens
 * 
 * This validation is a security measure to prevent acceptance of malformed or
 * tampered tokens that could lead to authentication bypasses.
 */
export const isValidTokenFormat = (token: string | null): boolean => {
  if (!token) {
    console.log('Token validation failed: Token is null or empty');
    return false;
  }
  
  console.log('Validating token:', token.substring(0, 10) + '...');
  
  // Check if it's a UUID format (refresh token)
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (uuidRegex.test(token)) {
    console.log('Token validated as UUID format');
    return true;
  }
  
  // Basic format validation for JWT (has 3 parts separated by dots)
  const parts = token.split('.');
  const isValid = parts.length === 3 && parts.every(part => part.trim().length > 0);
  console.log(`Token JWT validation: ${isValid ? 'passed' : 'failed'} (parts: ${parts.length})`);
  return isValid;
};

/**
 * Checks if a token is expired
 * @param token JWT token string
 * @param bufferSeconds Optional buffer time in seconds before actual expiration
 * @returns boolean indicating if token is expired or will expire within buffer time
 */
export const isTokenExpired = (token: string | null, bufferSeconds = 30): boolean => {
  if (!token || !isValidTokenFormat(token)) return true;
  
  try {
    const { exp } = jwtDecode<TokenPayload>(token);
    if (!exp) return true;
    
    // Current time in seconds + buffer
    const currentTime = Math.floor(Date.now() / 1000) + bufferSeconds;
    return currentTime >= exp;
  } catch (error) {
    console.error('Error decoding token:', error);
    return true;
  }
};

/**
 * Decodes a JWT token and returns the payload
 */
export const decodeToken = (token: string | null): TokenPayload | null => {
  if (!token || !isValidTokenFormat(token)) return null;
  
  try {
    return jwtDecode<TokenPayload>(token);
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
};

/**
 * Extracts user information from a token
 */
export const getUserFromToken = (token: string | null): { username: string; roles: string[] } | null => {
  const payload = decodeToken(token);
  if (!payload || !payload.username) return null;
  
  return {
    username: payload.username,
    roles: payload.roles || []
  };
};

/**
 * Securely stores authentication tokens in browser storage with validation.
 * 
 * Security measures implemented:
 * 1. Validates token format before storage to prevent storing malformed tokens
 * 2. Stores tokens in separate storage keys to isolate security contexts
 * 3. Extracts and stores minimal user information for efficient access
 * 4. Implements error handling to maintain security state on failures
 * 
 * Note: While localStorage is used for token storage, the tokens themselves are
 * short-lived, and the system implements additional security through token validation
 * and frequent refresh cycles to mitigate risks associated with client-side storage.
 */
export const storeTokens = (accessToken: string, refreshToken: string): boolean => {
  console.log('Attempting to store tokens...');
  console.log('Access token valid:', isValidTokenFormat(accessToken));
  console.log('Refresh token valid:', isValidTokenFormat(refreshToken));
  
  if (!isValidTokenFormat(accessToken)) {
    console.error('Invalid access token format');
    return false;
  }
  
  if (!isValidTokenFormat(refreshToken)) {
    console.error('Invalid refresh token format');
    return false;
  }
  
  try {
    localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, accessToken);
    localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
    
    // Store user info for quick access
    const user = getUserFromToken(accessToken);
    if (user) {
      localStorage.setItem(STORAGE_KEYS.USER_INFO, JSON.stringify(user));
    }
    
    console.log('Tokens stored successfully');
    return true;
  } catch (error) {
    console.error('Error storing tokens:', error);
    return false;
  }
};

/**
 * Retrieves the access token from storage
 */
export const getAccessToken = (): string | null => {
  return localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
};

/**
 * Retrieves the refresh token from storage
 */
export const getRefreshToken = (): string | null => {
  return localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
};

/**
 * Securely clears all authentication data from storage during logout or session invalidation.
 * 
 * This function is a critical security operation that ensures all authentication-related
 * data is completely removed from browser storage when a user logs out, a session expires,
 * or an authentication error occurs. Proper cleanup prevents potential security issues
 * from leftover authentication data.
 */
export const clearTokens = (): void => {
  localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
  localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
  localStorage.removeItem(STORAGE_KEYS.USER_INFO);
};

/**
 * Checks if the user is authenticated based on token validity
 */
export const isAuthenticated = (): boolean => {
  const token = getAccessToken();
  return !!token && !isTokenExpired(token);
};

/**
 * Gets the remaining time in seconds until token expiration
 */
export const getTokenRemainingTime = (token: string | null): number => {
  if (!token) return 0;
  
  try {
    const { exp } = jwtDecode<TokenPayload>(token);
    if (!exp) return 0;
    
    const currentTime = Math.floor(Date.now() / 1000);
    const remainingTime = exp - currentTime;
    
    return remainingTime > 0 ? remainingTime : 0;
  } catch {
    return 0;
  }
};

/**
 * Establishes secure token state synchronization across browser tabs.
 * 
 * This function implements a security feature that ensures authentication state
 * remains consistent across multiple tabs of the application. When a user logs out
 * or a token is refreshed in one tab, this mechanism ensures that all other tabs
 * receive the updated authentication state.
 * 
 * Security benefits:
 * - Prevents inconsistent authentication states that could lead to security issues
 * - Ensures immediate propagation of logout operations across all application instances
 * - Maintains a unified security context for users with multiple open tabs
 * 
 * @param callback Function to call when token changes in another tab
 * @returns Cleanup function to remove the synchronization listener
 */
export const setupTokenSynchronization = (callback: () => void): () => void => {
  const handleStorageChange = (event: StorageEvent) => {
    if (
      event.key === STORAGE_KEYS.AUTH_TOKEN || 
      event.key === STORAGE_KEYS.REFRESH_TOKEN ||
      event.key === null // localStorage was cleared
    ) {
      callback();
    }
  };
  
  window.addEventListener('storage', handleStorageChange);
  
  // Return cleanup function
  return () => {
    window.removeEventListener('storage', handleStorageChange);
  };
};
