/**
 * Central type definitions for the KeyBastion application
 * 
 * This file serves as a central hub for type definitions used throughout the application,
 * ensuring consistent typing and avoiding circular dependencies.
 */

// Re-export types from jwt-decode
import type { JwtPayload } from 'jwt-decode';
export type { JwtPayload };

// Re-export types from axios
import type { 
  AxiosInstance, 
  AxiosRequestConfig, 
  InternalAxiosRequestConfig, 
  AxiosResponse 
} from 'axios';
export type { 
  AxiosInstance, 
  AxiosRequestConfig, 
  InternalAxiosRequestConfig, 
  AxiosResponse 
};

// Token related types
export interface TokenPayload extends JwtPayload {
  sub?: string;
  username?: string;
  roles?: string[];
  email?: string;
  firstName?: string;
  lastName?: string;
  userId?: string;
}

// Auth related types
export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
}

export interface UserCredentials {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  password: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role?: string;
}

export interface UserProfile {
  id: string;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  roles: string[];
  createdAt: string;
  lastLogin?: string;
}

export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
}

// Password related types
export interface PasswordGenerationRequest {
  length?: number;
  includeUppercase?: boolean;
  includeLowercase?: boolean;
  includeNumbers?: boolean;
  includeSymbols?: boolean;
  excludeSimilarCharacters?: boolean;
}

export interface PasswordGenerationResponse {
  password: string;
  strength: number;
  suggestions?: string[];
}

export interface PasswordEvaluationRequest {
  password: string;
}

export interface PasswordEvaluationResponse {
  strength: number;
  feedback: {
    warning?: string;
    suggestions: string[];
  };
}

// Credential related types
export interface Credential {
  id: string;
  title: string;
  username: string;
  password: string;
  url?: string;
  notes?: string;
  categoryId?: string;
  category?: Category;
  createdAt: string;
  updatedAt: string;
}

export interface SaveCredentialRequest {
  title: string;
  username: string;
  password: string;
  url?: string;
  notes?: string;
  categoryId?: string;
}

export interface CredentialsResponse {
  credentials: Credential[];
  totalCount: number;
}

// Category related types
export interface Category {
  id: string;
  name: string;
  description?: string;
  type: CategoryType;
  createdAt: string;
  updatedAt: string;
}

// Using string literal type instead of enum for better compatibility
export type CategoryType = 'GLOBAL' | 'USER';

// Constants for CategoryType values
export const CATEGORY_TYPES = {
  GLOBAL: 'GLOBAL' as CategoryType,
  USER: 'USER' as CategoryType
}

// Activity related types
export interface RecentActivity {
  id: string;
  action: string;
  resourceType: string;
  resourceId: string;
  resourceName?: string;
  timestamp: string;
  userId: string;
  username?: string;
}

export interface ActivityLog {
  id: string;
  action: string;
  resourceType: string;
  resourceId: string;
  resourceName?: string;
  timestamp: string;
  userId: string;
  username?: string;
  ipAddress?: string;
  userAgent?: string;
}

// Dashboard related types
export interface DashboardStats {
  totalCredentials: number;
  totalCategories: number;
  totalSharedCredentials: number;
  recentActivities: RecentActivity[];
  passwordStrengthDistribution: {
    weak: number;
    medium: number;
    strong: number;
  };
}

// Sharing related types
export interface SharedCredentialDetail {
  id: string;
  credential: Credential;
  sharedBy: {
    id: string;
    username: string;
  };
  sharedAt: string;
  expiresAt?: string;
}

// Admin related types
export interface User {
  id: string;
  username: string;
  email: string;
  role: string;
  createdAt: string;
  lastLogin?: string;
  status?: string;
}

export interface CategoryStatsResponse {
  categories: {
    name: string;
    count: number;
  }[];
  totalCategories: number;
  totalCredentials: number;
}

export interface SharingStatsResponse {
  totalShared: number;
  sharingByUser: {
    username: string;
    count: number;
  }[];
}
