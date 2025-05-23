import axios, { AxiosInstance, AxiosRequestConfig, InternalAxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { API_BASE_URL, DEFAULT_TIMEOUT, API_ENDPOINTS } from './config';
import {
    isTokenExpired,
    getAccessToken,
    getRefreshToken,
    storeTokens,
    clearTokens,
    isValidTokenFormat
} from '../utils/tokenUtils';

/**
 * Configuration interface for API requests with additional security options.
 * Extends the standard Axios request configuration with KeyBastion-specific
 * authorization and retry settings.
 */
interface ApiConfig extends AxiosRequestConfig {
    /** Whether the request requires authentication. Defaults to true. */
    requireAuth?: boolean;
    /** Current retry count for failed requests. Used internally. */
    retryCount?: number;
    /** Maximum number of retries for failed requests. Defaults to MAX_RETRIES. */
    maxRetries?: number;
}

/**
 * Core API client that provides secure communication with the KeyBastion backend.
 * 
 * This class implements several critical security features:
 * 1. Automatic token validation and refresh
 * 2. Authorization header management
 * 3. Token format validation
 * 4. Session expiration handling
 * 5. Request retry with exponential backoff
 * 6. Secure error handling that prevents sensitive information exposure
 * 
 * The ApiClient is a singleton used throughout the application for all backend
 * communication, ensuring consistent security enforcement for all API requests.
 */
class ApiClient {
    private instance: AxiosInstance;
    private refreshPromise: Promise<string | null> | null = null;
    private readonly MAX_RETRIES = 3;
    private readonly RETRY_DELAY = 1000;

    constructor() {
        this.instance = axios.create({
            baseURL: API_BASE_URL,
            timeout: DEFAULT_TIMEOUT,
            headers: {
                'Content-Type': 'application/json',
                'X-Requested-With': 'XMLHttpRequest'
            }
        });
        this.setupInterceptors();
    }

    /**
     * Sets up request and response interceptors for secure API communication.
     * 
     * The interceptors implement critical security functions:
     * - Automatically attaches authorization tokens to requests
     * - Validates token format before sending requests
     * - Handles token expiration by refreshing tokens when needed
     * - Implements secure retry logic for network failures
     * - Manages authentication failures and session expiration
     * 
     * This creates multiple layers of security to ensure that all API
     * communications are properly authenticated and protected.
     */
    private setupInterceptors(): void {
        this.instance.interceptors.request.use(
            async (config: InternalAxiosRequestConfig) => {
                const apiConfig = config as ApiConfig;

                if (apiConfig.requireAuth !== false) {
                    const token = getAccessToken();

                    if (token) {
                        if (!isValidTokenFormat(token)) {
                            console.error('Invalid token format detected');
                            this.handleAuthFailure();
                            return config;
                        }

                        if (isTokenExpired(token, 60)) {
                            const newToken = await this.refreshToken();
                            if (newToken) {
                                config.headers.Authorization = `Bearer ${newToken}`;
                                return config;
                            }
                        }
                        config.headers.Authorization = `Bearer ${token}`;
                    }
                }
                return config;
            },
            (error: AxiosError) => Promise.reject(error)
        );

        this.instance.interceptors.response.use(
            (response: AxiosResponse) => response,
            async (error: AxiosError) => {
                const originalRequest = error.config as ApiConfig & { _retry?: boolean };

                // Skip retry for non-auth requests
                if (originalRequest.requireAuth === false) {
                    return Promise.reject(error);
                }

                // Network error retry logic
                if (!error.response &&
                    (originalRequest.retryCount || 0) < (originalRequest.maxRetries || this.MAX_RETRIES)) {
                    const retryCount = originalRequest.retryCount = (originalRequest.retryCount || 0) + 1;
                    const delay = this.RETRY_DELAY * Math.pow(2, retryCount - 1);

                    await new Promise(resolve => setTimeout(resolve, delay));
                    return this.instance(originalRequest);
                }

                // Handle 401 Unauthorized
                if (error.response?.status === 401 && !originalRequest._retry) {
                    originalRequest._retry = true;
                    try {
                        const newToken = await this.refreshToken();
                        if (newToken && error.config) {
                            error.config.headers.Authorization = `Bearer ${newToken}`;
                            return this.instance(error.config);
                        }
                    } catch (refreshError) {
                        this.handleAuthFailure();
                    }
                }

                this.handleRequestError(error);
                return Promise.reject(error);
            }
        );
    }

    /**
     * Securely refreshes the authentication token when it expires.
     * 
     * This method implements several security features:
     * - Uses a promise cache to prevent multiple simultaneous refresh attempts
     * - Validates token format before and after refresh
     * - Implements proper error handling for authentication failures
     * - Securely stores new tokens upon successful refresh
     * 
     * The method ensures that only valid tokens are used for authentication
     * and automatically initiates re-authentication when tokens cannot be refreshed.
     * 
     * @returns A Promise resolving to the new access token or null if refresh failed
     */
    private async refreshToken(): Promise<string | null> {
        if (this.refreshPromise) return this.refreshPromise;

        this.refreshPromise = (async () => {
            try {
                const refreshToken = getRefreshToken();
                if (!refreshToken || !isValidTokenFormat(refreshToken)) {
                    throw new Error('Invalid refresh token');
                }

                const response = await axios.post(API_ENDPOINTS.AUTH.REFRESH,
                    { refreshToken },
                    { baseURL: API_BASE_URL }
                );

                const { accessToken, refreshToken: newRefreshToken } = response.data;
                if (!isValidTokenFormat(accessToken) || !isValidTokenFormat(newRefreshToken)) {
                    throw new Error('Invalid tokens received');
                }

                storeTokens(accessToken, newRefreshToken);
                return accessToken;
            } catch (error) {
                this.handleAuthFailure();
                return null;
            } finally {
                this.refreshPromise = null;
            }
        })();

        return this.refreshPromise;
    }

    /**
     * Handles authentication failures by securely terminating the current session.
     * 
     * Security actions performed:
     * - Clears all authentication tokens from storage
     * - Notifies the application of authentication requirement
     * - Redirects to the login page with the original destination preserved
     * 
     * This method ensures that users cannot continue using the application
     * with invalid or expired authentication credentials.
     */
    private handleAuthFailure(): void {
        clearTokens();
        window.dispatchEvent(new CustomEvent('auth:required'));
        if (!window.location.pathname.includes('/login')) {
            window.location.href = '/login?redirect=' + encodeURIComponent(window.location.pathname);
        }
    }

    private handleRequestError(error: unknown): void {
        if (axios.isAxiosError(error)) {
            const status = error.response?.status;
            const message = error.response?.data?.message || error.message;
            console.error(`Request failed (${status}): ${message}`);
        }
    }

    public async get<T>(url: string, config?: ApiConfig): Promise<T> {
        const response = await this.instance.get<T>(url, config);
        return response.data;
    }

    public async post<T>(url: string, data?: any, config?: ApiConfig): Promise<T> {
        try {
            const response = await this.instance.post<T>(url, data, config);
            console.log(`API Response for ${url}:`, response.data);
            return response.data;
        } catch (error) {
            console.error(`API Error for ${url}:`, error);
            if (axios.isAxiosError(error) && error.response) {
                console.error('Response data:', error.response.data);
                console.error('Response status:', error.response.status);
                console.error('Response headers:', error.response.headers);
            }
            throw error;
        }
    }

    public async put<T>(url: string, data?: any, config?: ApiConfig): Promise<T> {
        const response = await this.instance.put<T>(url, data, config);
        return response.data;
    }

    /**
     * Performs a secure DELETE request to the API.
     * 
     * This method is particularly important for credential deletion operations,
     * including the shared credential deletion flow. It ensures that deletion
     * requests are properly authenticated and that the server response is
     * correctly handled.
     * 
     * @param url The API endpoint URL
     * @param config Optional request configuration
     * @returns Promise resolving to the response data
     */
    public async delete<T>(url: string, config?: ApiConfig): Promise<T> {
        const response = await this.instance.delete<T>(url, config);
        return response.data;
    }
}

export const api = new ApiClient();
export default api;
