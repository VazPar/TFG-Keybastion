import api from './api';
import { API_ENDPOINTS } from './config';

// Types
export interface AdminUserCreationRequest {
  username: string;
  email: string;
  password: string;
  role: string;
}

export interface CategoryStatsResponse {
  categoryName: string;
  passwordCount: number;
}

export interface SharingStatsResponse {
  categoryName: string;
  shareCount: number;
}

export interface User {
  id: string;
  username: string;
  email: string;
  role: string;
  createdAt: string;
}

export interface ActivityLog {
  id: string;
  userId: string;
  username: string;
  action: string;
  details: string;
  timestamp: string;
  ipAddress?: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  global: boolean;
  userId: string;
}

class AdminService {
  /**
   * Create a new admin user
   */
  public async createAdminUser(userData: AdminUserCreationRequest): Promise<User> {
    try {
      console.log('Creating user with data:', { ...userData, password: '[REDACTED]' });
      
      // Ensure role is uppercase as expected by the backend
      const formattedData = {
        ...userData,
        role: userData.role.toUpperCase()
      };
      
      const response = await api.post<User>(
        API_ENDPOINTS.ADMIN.USERS,
        formattedData,
        { requireAuth: true }
      );
      
      console.log('User creation response:', response);
      return response;
    } catch (error) {
      console.error('Failed to create admin user:', error);
      throw error;
    }
  }

  /**
   * Get all users
   */
  public async getAllUsers(): Promise<User[]> {
    try {
      const response = await api.get<User[]>(
        API_ENDPOINTS.ADMIN.USERS,
        { requireAuth: true }
      );
      return response;
    } catch (error) {
      console.error('Failed to get users:', error);
      throw error;
    }
  }

  /**
   * Get all activity logs
   */
  public async getAllActivityLogs(
    action?: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<ActivityLog[]> {
    try {
      let url = API_ENDPOINTS.ADMIN.ACTIVITY_LOGS;
      const params: string[] = [];
      
      if (action) {
        params.push(`action=${encodeURIComponent(action)}`);
      }
      
      if (startDate) {
        params.push(`startDate=${encodeURIComponent(startDate.toISOString())}`);
      }
      
      if (endDate) {
        params.push(`endDate=${encodeURIComponent(endDate.toISOString())}`);
      }
      
      if (params.length > 0) {
        url = `${url}?${params.join('&')}`;
      }
      
      const response = await api.get<ActivityLog[]>(
        url,
        { requireAuth: true }
      );
      return response;
    } catch (error) {
      console.error('Failed to get activity logs:', error);
      throw error;
    }
  }

  /**
   * Get activity logs for a specific user
   */
  public async getUserActivityLogs(userId: string): Promise<ActivityLog[]> {
    try {
      const response = await api.get<ActivityLog[]>(
        `${API_ENDPOINTS.ADMIN.ACTIVITY_LOGS}/${userId}`,
        { requireAuth: true }
      );
      return response;
    } catch (error) {
      console.error(`Failed to get activity logs for user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Get category statistics
   */
  public async getCategoryStats(): Promise<CategoryStatsResponse[]> {
    try {
      const response = await api.get<CategoryStatsResponse[]>(
        API_ENDPOINTS.ADMIN.STATS_CATEGORY,
        { requireAuth: true }
      );
      return response;
    } catch (error) {
      console.error('Failed to get category stats:', error);
      throw error;
    }
  }

  /**
   * Get sharing statistics
   */
  public async getSharingStats(): Promise<SharingStatsResponse[]> {
    try {
      const response = await api.get<SharingStatsResponse[]>(
        API_ENDPOINTS.ADMIN.STATS_SHARING,
        { requireAuth: true }
      );
      return response;
    } catch (error) {
      console.error('Failed to get sharing stats:', error);
      throw error;
    }
  }

  /**
   * Get all categories
   */
  public async getAllCategories(): Promise<Category[]> {
    try {
      const response = await api.get<Category[]>(
        API_ENDPOINTS.ADMIN.CATEGORIES,
        { requireAuth: true }
      );
      return response;
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      throw error;
    }
  }

  /**
   * Create a new global category
   */
  public async createGlobalCategory(category: { name: string; description?: string }): Promise<Category> {
    try {
      const response = await api.post<Category>(
        API_ENDPOINTS.ADMIN.CATEGORIES,
        { ...category, global: true },
        { requireAuth: true }
      );
      return response;
    } catch (error) {
      console.error('Failed to create global category:', error);
      throw error;
    }
  }
}

export const adminService = new AdminService();
