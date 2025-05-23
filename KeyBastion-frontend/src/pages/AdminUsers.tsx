import { useState, useEffect } from 'react';
import { 
  UserGroupIcon,
  UserPlusIcon,
} from '@heroicons/react/24/outline';
import { adminService } from '../services/adminService';
import type { User } from '../types';
import { useAuth } from '../context/AuthContext';

// Import the AdminUserCreation component
import AdminUserCreation from '../components/AdminUserCreation';

const AdminUsers = () => {
  const { hasRole } = useAuth();
  
  // State for users
  const [users, setUsers] = useState<User[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [usersError, setUsersError] = useState<string | null>(null);
  
  // State for modals
  const [showUserCreationModal, setShowUserCreationModal] = useState(false);
  
  // Debug logging for modal state
  useEffect(() => {
    console.log('Modal state changed:', showUserCreationModal);
  }, [showUserCreationModal]);
  
  useEffect(() => {
    // Verify admin role
    if (!hasRole('ADMIN')) {
      return;
    }
    
    fetchUsers();
  }, [hasRole]);
  
  // Fetch users
  const fetchUsers = async () => {
    try {
      setIsLoadingUsers(true);
      setUsersError(null);
      const response = await adminService.getAllUsers();
      setUsers(response);
    } catch (error) {
      console.error('Error fetching users:', error);
      setUsersError('Failed to load users. Please try again later.');
    } finally {
      setIsLoadingUsers(false);
    }
  };
  
  // Handle user creation
  const handleUserCreation = async (userData: { username: string; email: string; password: string; role: string }) => {
    try {
      // Log the attempt (with password redacted for security)
      console.log('Creating user with data:', { 
        username: userData.username,
        email: userData.email, 
        role: userData.role,
        password: '[REDACTED]' 
      });
      
      // Make the API call to create the user
      const result = await adminService.createAdminUser(userData);
      
      console.log('User creation successful:', result);
      
      // Close the modal and refresh the user list
      setShowUserCreationModal(false);
      fetchUsers();
      
      return Promise.resolve();
    } catch (error: any) {
      console.error('Error creating user:', error);
      
      // Extract error message from various possible locations in the response
      let errorMessage = 'Failed to create user. Please try again.';
      
      if (error.response) {
        if (error.response.data) {
          if (typeof error.response.data === 'string') {
            errorMessage = error.response.data;
          } else if (error.response.data.error) {
            errorMessage = error.response.data.error;
          } else if (error.response.data.message) {
            errorMessage = error.response.data.message;
          }
        }
        
        // Log the specific error details for debugging
        console.error('Response status:', error.response.status);
        console.error('Response data:', error.response.data);
      }
      
      return Promise.reject(errorMessage);
    }
  };
  
  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric'
    });
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">User Management</h1>
        <button
          onClick={() => setShowUserCreationModal(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-sky-700 hover:bg-sky-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 transition-colors duration-200"
        >
          <UserPlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
          Add User
        </button>
      </div>
      
      {/* Users Section */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex items-center">
            <UserGroupIcon className="h-6 w-6 text-sky-600 mr-2" />
            <h2 className="text-lg font-medium text-gray-900">System Users</h2>
          </div>
          
          {isLoadingUsers ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-sky-600"></div>
            </div>
          ) : usersError ? (
            <div className="text-red-500 py-4">{usersError}</div>
          ) : (
            <div className="mt-6 overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Username
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr key={user.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {user.username}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          user.role === 'ADMIN' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(user.createdAt)}
                      </td>
                    </tr>
                  ))}
                  {users.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500">
                        No users found
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
      {showUserCreationModal && (
        <AdminUserCreation
          onSubmit={handleUserCreation}
          onCancel={() => setShowUserCreationModal(false)}
        />
      )}
    </div>
  );
};

export default AdminUsers;
