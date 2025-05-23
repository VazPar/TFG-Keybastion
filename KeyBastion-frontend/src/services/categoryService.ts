import api from './api';

export interface Category {
  id: string;
  name: string;
  description?: string;
  categoryType?: string;
}

export interface CategoryType {
  value: string;
  label: string;
}

// Default category types to use if API call fails
const DEFAULT_CATEGORY_TYPES: CategoryType[] = [
  { value: 'BANKING', label: 'Banking' },
  { value: 'SOCIAL_MEDIA', label: 'Social Media' },
  { value: 'EMAIL', label: 'Email' },
  { value: 'SHOPPING', label: 'Shopping' },
  { value: 'ENTERTAINMENT', label: 'Entertainment' },
  { value: 'WORK', label: 'Work' },
  { value: 'EDUCATION', label: 'Education' },
  { value: 'GAMING', label: 'Gaming' },
  { value: 'FINANCE', label: 'Finance' },
  { value: 'TRAVEL', label: 'Travel' },
  { value: 'HEALTH', label: 'Health' },
  { value: 'OTHER', label: 'Other' }
];

class CategoryService {
  /**
   * Get all categories for the current user
   */
  public async getCategories(): Promise<Category[]> {
    try {
      return await api.get('/api/categories');
    } catch (error) {
      console.error('Error fetching categories:', error);
      return [];
    }
  }

  /**
   * Get all predefined category types
   */
  public async getCategoryTypes(): Promise<CategoryType[]> {
    try {
      const types = await api.get('/api/categories/types');
      return Array.isArray(types) ? types : DEFAULT_CATEGORY_TYPES;
    } catch (error) {
      console.error('Error fetching category types:', error);
      // Return default categories if API fails
      return DEFAULT_CATEGORY_TYPES;
    }
  }

  /**
   * Create a new category
   */
  public async createCategory(category: Omit<Category, 'id'>): Promise<Category> {
    try {
      return await api.post('/api/categories', category);
    } catch (error) {
      console.error('Error creating category:', error);
      throw error;
    }
  }

  /**
   * Create a new category from a category type
   */
  public async createCategoryFromType(categoryType: string, name: string, description?: string): Promise<Category> {
    try {
      return await api.post('/api/categories/from-type', {
        categoryType,
        name,
        description
      });
    } catch (error) {
      console.error('Error creating category from type:', error);
      throw error;
    }
  }

  /**
   * Get a category by ID
   */
  public async getCategoryById(id: string): Promise<Category> {
    try {
      return await api.get(`/api/categories/${id}`);
    } catch (error) {
      console.error(`Error fetching category with ID ${id}:`, error);
      throw error;
    }
  }
}

export const categoryService = new CategoryService();
export default categoryService;
