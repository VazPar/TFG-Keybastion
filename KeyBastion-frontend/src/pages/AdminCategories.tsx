import { useState, useEffect } from 'react';
import { 
  FolderIcon,
  FolderPlusIcon,
} from '@heroicons/react/24/outline';
import { adminService, type Category } from '../services/adminService';
import { useAuth } from '../context/AuthContext';

// Import the AdminGlobalCategory component
import AdminGlobalCategory from '../components/AdminGlobalCategory';

const AdminCategories = () => {
  const { hasRole } = useAuth();
  
  // State for categories
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [categoriesError, setCategoriesError] = useState<string | null>(null);
  
  // State for modals
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  
  useEffect(() => {
    // Verify admin role
    if (!hasRole('ADMIN')) {
      return;
    }
    
    fetchCategories();
  }, [hasRole]);
  
  // Fetch global categories
  const fetchCategories = async () => {
    try {
      setIsLoadingCategories(true);
      setCategoriesError(null);
      
      // Use adminService instead of direct fetch
      const allCategories = await adminService.getAllCategories();
      
      // Filter for global categories
      const globalCategories = allCategories.filter((cat: Category) => cat.global);
      setCategories(globalCategories);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setCategoriesError('Failed to load categories. Please try again later.');
    } finally {
      setIsLoadingCategories(false);
    }
  };
  
  // Handle category creation
  const handleCategoryCreation = async (categoryData: { name: string; description?: string }) => {
    try {
      await adminService.createGlobalCategory(categoryData);
      setShowCategoryModal(false);
      
      // Refresh category list
      fetchCategories();
      
      return Promise.resolve();
    } catch (error: any) {
      console.error('Error creating category:', error);
      
      // Extract error message for display
      const errorMessage = error.response?.data?.message || 'Failed to create category. Please try again.';
      return Promise.reject(errorMessage);
    }
  };
  
  // Removed unused formatDate function
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Global Categories</h1>
        <button
          onClick={() => setShowCategoryModal(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-sky-700 hover:bg-sky-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500"
        >
          <FolderPlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
          Add Global Category
        </button>
      </div>
      
      {/* Categories Section */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex items-center">
            <FolderIcon className="h-6 w-6 text-sky-700 mr-2" />
            <h2 className="text-lg font-medium text-gray-900">System Categories</h2>
          </div>
          
          <p className="mt-1 text-sm text-gray-500">
            Global categories are available to all users and cannot be modified by regular users.
          </p>
          
          {isLoadingCategories ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-sky-700"></div>
            </div>
          ) : categoriesError ? (
            <div className="text-red-500 py-4">{categoriesError}</div>
          ) : (
            <div className="mt-6 overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Description
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created By
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Usage Count
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {categories.map((category) => (
                    <tr key={category.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {category.name}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {category.description || 'No description'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        Admin
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {/* This would ideally come from the API */}
                        -
                      </td>
                    </tr>
                  ))}
                  {categories.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500">
                        No global categories found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
      
      {/* Modals */}
      {showCategoryModal && (
        <AdminGlobalCategory
          onSubmit={handleCategoryCreation}
          onCancel={() => setShowCategoryModal(false)}
        />
      )}
    </div>
  );
};

export default AdminCategories;
