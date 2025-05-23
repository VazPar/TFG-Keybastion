import api from './api';
import { API_ENDPOINTS, STORAGE_KEYS } from './config';
import { 
    storeTokens, 
    clearTokens, 
    decodeToken, 
    isAuthenticated, 
    getAccessToken,
    TokenPayload
} from '../utils/tokenUtils';
import type { LoginResponse, UserCredentials, RegisterRequest } from '../types';

class AuthService {
    /**
     * Authenticates a user and stores their tokens securely
     * @param credentials User login credentials
     * @returns LoginResponse with tokens and user info
     */
    public async login(credentials: UserCredentials): Promise<LoginResponse> {
        try {
            const response = await api.post<LoginResponse>(
                API_ENDPOINTS.AUTH.LOGIN,
                credentials,
                { requireAuth: false }
            );

            // Log the response to help with debugging
            console.log('Login response:', response);

            // Validate and store tokens securely
            if (!response || typeof response !== 'object') {
                throw new Error('Invalid response: Empty or malformed response');
            }

            const { access_token, refresh_token } = response;
            
            if (!access_token || !refresh_token) {
                throw new Error('Invalid response: Missing tokens');
            }

            const success = storeTokens(access_token, refresh_token);
            if (!success) {
                throw new Error('Failed to store authentication tokens');
            }

            // Dispatch auth success event
            window.dispatchEvent(new CustomEvent('auth:login', { 
                detail: { user: decodeToken(access_token) } 
            }));

            return response;
        } catch (error) {
            // Clear any partial auth data on failure
            this.logout();
            console.error('Login failed:', error);
            throw error;
        }
    }

    /**
     * Registers a new user
     * @param userData User registration data
     * @returns LoginResponse with tokens and user info
     */
    public async register(userData: RegisterRequest): Promise<LoginResponse> {
        try {
            const response = await api.post<LoginResponse>(
                API_ENDPOINTS.AUTH.REGISTER,
                userData,
                { requireAuth: false }
            );

            // Validate and store tokens securely
            const { access_token, refresh_token } = response;
            
            if (!access_token || !refresh_token) {
                throw new Error('Invalid response: Missing tokens');
            }

            const success = storeTokens(access_token, refresh_token);
            if (!success) {
                throw new Error('Failed to store authentication tokens');
            }

            // Dispatch auth success event
            window.dispatchEvent(new CustomEvent('auth:register', { 
                detail: { user: decodeToken(access_token) } 
            }));

            return response;
        } catch (error) {
            console.error('Registration failed:', error);
            throw error;
        }
    }

    /**
     * Refreshes the access token using the refresh token
     * @returns New access token or null if refresh failed
     */
    public async refreshToken(): Promise<string | null> {
        try {
            const refreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
            if (!refreshToken) {
                throw new Error('No refresh token available');
            }

            const response = await api.post<{ accessToken: string; refreshToken: string }>(
                API_ENDPOINTS.AUTH.REFRESH,
                { refreshToken },
                { requireAuth: false }
            );

            const { accessToken, refreshToken: newRefreshToken } = response;
            
            if (!accessToken || !newRefreshToken) {
                throw new Error('Invalid response: Missing tokens');
            }

            const success = storeTokens(accessToken, newRefreshToken);
            if (!success) {
                throw new Error('Failed to store refreshed tokens');
            }

            return accessToken;
        } catch (error) {
            console.error('Token refresh failed:', error);
            this.logout();
            return null;
        }
    }

    /**
     * Logs out the current user and clears all auth data
     * @param redirectToLogin Whether to redirect to login page after logout
     */
    public logout(redirectToLogin = true): void {
        // Try to call logout endpoint if user is authenticated
        if (isAuthenticated()) {
            // Get the refresh token
            const refreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
            
            // Only call the logout endpoint if we have a refresh token
            if (refreshToken) {
                // Fire and forget - don't wait for response
                api.post(API_ENDPOINTS.AUTH.LOGOUT || '/api/auth/logout', { refreshToken }, { 
                    requireAuth: true 
                }).catch(err => {
                    console.warn('Logout request failed:', err);
                });
            }
        }

        // Clear all tokens and user data
        clearTokens();
        
        // Dispatch logout event
        window.dispatchEvent(new CustomEvent('auth:logout'));
        
        // Redirect to login page if requested
        if (redirectToLogin) {
            window.location.href = '/login';
        }
    }

    /**
     * Gets the current authenticated user
     * @returns User payload from token or null if not authenticated
     */
    public getCurrentUser(): TokenPayload | null {
        const token = getAccessToken();
        return decodeToken(token);
    }

    /**
     * Checks if the current user has a specific role
     * @param role Role to check for
     * @returns boolean indicating if user has the role
     */
    public hasRole(role: string): boolean {
        const user = this.getCurrentUser();
        // Check only for the role name without prefix, as the backend now handles prefixing
        return user?.roles?.includes(role) || false;
    }

    /**
     * Checks if the user is currently authenticated
     * @returns boolean indicating authentication status
     */
    public isAuthenticated(): boolean {
        return isAuthenticated();
    }

    /**
     * Sets up cross-tab authentication synchronization
     * @param callback Function to call when auth state changes in another tab
     */
    public setupAuthSync(callback: () => void): () => void {
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
    }
}

export const authService = new AuthService();
