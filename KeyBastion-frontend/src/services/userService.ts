import api from './api';

export interface User {
  id: string;
  username: string;
  email: string;
  role: string;
  hasSecurityPin: boolean;
}

export interface UserSettings {
  id: string;
  userId: string;
  darkMode: boolean;
  notificationsEnabled: boolean;
}

class UserService {
  public async getCurrentUser(): Promise<User> {
    return api.get('/api/users/me');
  }
  
  public async getUserSettings(): Promise<UserSettings> {
    return api.get('/api/users/settings');
  }
  
  public async updateUserSettings(settings: Partial<UserSettings>): Promise<UserSettings> {
    return api.put('/api/users/settings', settings);
  }
  
  public async verifyPassword(password: string): Promise<{ valid: boolean }> {
    return api.post('/api/users/verify-password', { password });
  }
  
  public async setSecurityPin(pin: string, password: string): Promise<{ message: string }> {
    return api.post('/api/users/set-pin', { pin, password });
  }
  
  public async hasSecurityPin(): Promise<{ hasPin: boolean }> {
    return api.get('/api/users/has-pin');
  }
}

export const userService = new UserService();
