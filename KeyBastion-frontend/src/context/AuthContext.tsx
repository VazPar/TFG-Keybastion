import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService } from '../services/authService';
import type { UserCredentials, RegisterRequest, UserProfile } from '../types';
import type { TokenPayload } from '../types';

/**
 * AuthContextType defines the shape of the authentication context.
 * 
 * This interface encapsulates all authentication-related state and functions
 * that need to be accessible throughout the application. It provides a
 * centralized way to manage user authentication state, handle login/logout
 * operations, and check user permissions.
 */
interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (credentials: UserCredentials) => Promise<void>;
  register: (userData: RegisterRequest) => Promise<void>;
  logout: (redirectToLogin?: boolean) => void;
  hasRole: (role: string) => boolean;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Custom hook to access the authentication context.
 * 
 * This hook simplifies access to the authentication context throughout the application.
 * It includes a safety check to ensure it's only used within the AuthProvider's scope,
 * preventing potential runtime errors from undefined context access.
 * 
 * @returns The authentication context containing user state and auth functions
 * @throws Error if used outside of an AuthProvider
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

/**
 * Props interface for the AuthProvider component.
 */
interface AuthProviderProps {
  children: ReactNode;
}

/**
 * Authentication Provider component that manages user authentication state.
 * 
 * This component serves as the central authentication management system for the application.
 * It handles:
 * - Initial authentication state loading from stored tokens
 * - Login and registration processes
 * - Logout functionality
 * - Cross-tab authentication synchronization
 * - Role-based access control checks
 * - Authentication error management
 * 
 * The provider uses React's Context API to make authentication state and functions
 * available throughout the component tree without prop drilling.
 * 
 * @param props Component props containing children to render
 */
export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  /**
   * Initialize authentication state when the component mounts.
   * 
   * This effect runs once on component mount and checks if the user has a valid
   * authentication token stored. If a valid token exists, it extracts the user
   * information and sets the authenticated state. Otherwise, it ensures the user
   * is logged out and authentication state is cleared.
   * 
   * This is crucial for maintaining authentication state across page refreshes
   * and browser sessions, providing a seamless user experience.
   */
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Check if user is authenticated
        if (authService.isAuthenticated()) {
          // Get user data from token
          const tokenPayload = authService.getCurrentUser();
          if (tokenPayload) {
            // Transform token payload to user profile
            setUser(transformPayloadToProfile(tokenPayload));
            setIsAuthenticated(true);
          } else {
            // Token is invalid, clear auth state
            authService.logout(false);
            setIsAuthenticated(false);
            setUser(null);
          }
        }
      } catch (err) {
        console.error('Auth initialization error:', err);
        // Clear auth state on error
        authService.logout(false);
        setIsAuthenticated(false);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  /**
   * Set up authentication state synchronization across browser tabs.
   * 
   * This effect establishes event listeners for authentication events and
   * synchronizes authentication state across multiple tabs/windows. This ensures
   * that when a user logs in or out in one tab, all other open tabs reflect
   * the same authentication state, preventing inconsistent UI states.
   * 
   * The synchronization is crucial for security (ensuring logout propagates
   * across all tabs) and for user experience (preventing confusing mixed states).
   */
  useEffect(() => {
    // Function to handle auth state changes from other tabs
    const handleAuthSync = () => {
      if (authService.isAuthenticated()) {
        const tokenPayload = authService.getCurrentUser();
        if (tokenPayload) {
          setUser(transformPayloadToProfile(tokenPayload));
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
          setUser(null);
        }
      } else {
        setIsAuthenticated(false);
        setUser(null);
      }
    };

    // Set up auth sync and get cleanup function
    const cleanup = authService.setupAuthSync(handleAuthSync);

    // Set up event listeners for auth events
    const handleLogin = (event: CustomEvent) => {
      if (event.detail?.user) {
        setUser(transformPayloadToProfile(event.detail.user));
        setIsAuthenticated(true);
        setError(null);
      }
    };

    const handleLogout = () => {
      setUser(null);
      setIsAuthenticated(false);
    };

    const handleAuthRequired = () => {
      setUser(null);
      setIsAuthenticated(false);
      setError('Your session has expired. Please log in again.');
    };

    // Add event listeners
    window.addEventListener('auth:login', handleLogin as EventListener);
    window.addEventListener('auth:register', handleLogin as EventListener);
    window.addEventListener('auth:logout', handleLogout);
    window.addEventListener('auth:required', handleAuthRequired);

    // Clean up event listeners and auth sync on unmount
    return () => {
      cleanup();
      window.removeEventListener('auth:login', handleLogin as EventListener);
      window.removeEventListener('auth:register', handleLogin as EventListener);
      window.removeEventListener('auth:logout', handleLogout);
      window.removeEventListener('auth:required', handleAuthRequired);
    };
  }, []);

  /**
   * Transforms a JWT token payload into a user profile object.
   * 
   * This helper function standardizes the conversion from raw token data to a
   * structured user profile that can be used throughout the application. It
   * handles potential missing fields and ensures a consistent user object structure.
   * 
   * @param payload - The decoded JWT token payload containing user information
   * @returns A structured UserProfile object with normalized properties
   */
  const transformPayloadToProfile = (payload: TokenPayload): UserProfile => {
    return {
      id: payload.userId || payload.sub || '',
      username: payload.username || '',
      email: payload.email || '',
      roles: payload.roles || [],
      createdAt: new Date(payload.iat ? payload.iat * 1000 : Date.now()).toISOString(),
      firstName: payload.firstName,
      lastName: payload.lastName
    };
  };

  /**
   * Authenticates a user with the provided credentials.
   * 
   * This function handles the login process, including:
   * - Setting loading and error states appropriately
   * - Calling the authentication service
   * - Error handling and user feedback
   * 
   * The actual user state update happens via the auth:login event handler
   * to ensure synchronization across tabs.
   * 
   * @param credentials - The user's login credentials (username/email and password)
   */
  const login = async (credentials: UserCredentials) => {
    setIsLoading(true);
    setError(null);
    
    try {
      await authService.login(credentials);
      // User state will be updated by the auth:login event handler
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Login failed. Please check your credentials.';
      setError(errorMessage);
      console.error('Login error:', err);
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Registers a new user with the provided information.
   * 
   * This function handles the registration process, including:
   * - Setting loading and error states appropriately
   * - Calling the authentication service to create a new account
   * - Error handling and user feedback
   * 
   * The actual user state update happens via the auth:register event handler
   * to ensure synchronization across tabs.
   * 
   * @param userData - The new user's registration information
   */
  const register = async (userData: RegisterRequest) => {
    setIsLoading(true);
    setError(null);
    
    try {
      await authService.register(userData);
      // User state will be updated by the auth:register event handler
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Registration failed. Please try again.';
      setError(errorMessage);
      console.error('Registration error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Logs out the current user and clears authentication state.
   * 
   * This function handles the logout process, including:
   * - Setting loading state
   * - Calling the authentication service to clear tokens
   * - Optionally redirecting to the login page
   * 
   * The actual user state update happens via the auth:logout event handler
   * to ensure synchronization across tabs.
   * 
   * @param redirectToLogin - Whether to redirect to the login page after logout (default: true)
   */
  const logout = (redirectToLogin = true) => {
    setIsLoading(true);
    authService.logout(redirectToLogin);
    // User state will be updated by the auth:logout event handler
    setIsLoading(false);
  };

  /**
   * Checks if the current user has a specific role.
   * 
   * This function is used for role-based access control throughout the application.
   * It delegates to the authentication service which checks the user's roles
   * from the JWT token.
   * 
   * @param role - The role to check for (e.g., 'ROLE_ADMIN', 'ROLE_USER')
   * @returns True if the user has the specified role, false otherwise
   */
  const hasRole = (role: string): boolean => {
    return authService.hasRole(role);
  };

  /**
   * Clears any authentication errors.
   * 
   * This utility function allows components to reset the error state after
   * displaying error messages to the user or when retrying operations.
   */
  const clearError = () => {
    setError(null);
  };

  // Context value
  const value = {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    register,
    logout,
    hasRole,
    clearError
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
