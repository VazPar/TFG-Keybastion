import { useState, useEffect } from 'react';
import {
    ShieldCheckIcon,
    ClockIcon,
    ChartBarIcon,
    UserPlusIcon,
    FolderPlusIcon
} from '@heroicons/react/24/outline';
import { adminService, User, ActivityLog, CategoryStatsResponse, SharingStatsResponse } from '../services/adminService';
import { useAuth } from '../context/AuthContext';
import AdminUserCreationComponent from '../components/AdminUserCreation';
import AdminGlobalCategoryComponent from '../components/AdminGlobalCategory';

// Define component props types
interface AdminUserCreationProps {
    onSubmit: (userData: { username: string; email: string; password: string; role: string }) => Promise<void>;
    onCancel: () => void;
}

interface AdminGlobalCategoryProps {
    onSubmit: (categoryData: { name: string; description?: string }) => Promise<void>;
    onCancel: () => void;
}

// Import components dynamically to avoid lint errors
const AdminUserCreation = (props: AdminUserCreationProps) => {
    // This is a temporary implementation that will be replaced by the actual component
    // when TypeScript recognizes the newly created files
    const { onSubmit, onCancel } = props;

    // We'll use React.lazy or dynamic import in a production environment
    return <AdminUserCreationComponent onSubmit={onSubmit} onCancel={onCancel} />;
};

const AdminGlobalCategory = (props: AdminGlobalCategoryProps) => {
    // This is a temporary implementation that will be replaced by the actual component
    // when TypeScript recognizes the newly created files
    const { onSubmit, onCancel } = props;

    // We'll use React.lazy or dynamic import in a production environment
    return <AdminGlobalCategoryComponent onSubmit={onSubmit} onCancel={onCancel} />;
};

const AdminDashboard = () => {
    const { hasRole } = useAuth();

    // State for users
    const [users, setUsers] = useState<User[]>([]);
    const [isLoadingUsers, setIsLoadingUsers] = useState(true);

    // State for activity logs
    const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
    const [isLoadingLogs, setIsLoadingLogs] = useState(true);

    // State for statistics
    const [categoryStats, setCategoryStats] = useState<CategoryStatsResponse[]>([]);
    const [sharingStats, setSharingStats] = useState<SharingStatsResponse[]>([]);
    const [isLoadingStats, setIsLoadingStats] = useState(true);

    // State for modals
    const [showUserCreationModal, setShowUserCreationModal] = useState(false);
    const [showCategoryModal, setShowCategoryModal] = useState(false);

    // Error states
    const [usersError, setUsersError] = useState<string | null>(null);
    const [logsError, setLogsError] = useState<string | null>(null);
    const [statsError, setStatsError] = useState<string | null>(null);

    useEffect(() => {
        // Verify admin role
        if (!hasRole('ADMIN')) {
            return;
        }

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

        // Fetch activity logs
        const fetchActivityLogs = async () => {
            try {
                setIsLoadingLogs(true);
                setLogsError(null);
                const response = await adminService.getAllActivityLogs();
                setActivityLogs(response);
            } catch (error) {
                console.error('Error fetching activity logs:', error);
                setLogsError('Failed to load activity logs. Please try again later.');
            } finally {
                setIsLoadingLogs(false);
            }
        };

        // Fetch statistics
        const fetchStats = async () => {
            try {
                setIsLoadingStats(true);
                setStatsError(null);

                const [categoryStatsResponse, sharingStatsResponse] = await Promise.all([
                    adminService.getCategoryStats(),
                    adminService.getSharingStats()
                ]);

                setCategoryStats(categoryStatsResponse);
                setSharingStats(sharingStatsResponse);
            } catch (error) {
                console.error('Error fetching statistics:', error);
                setStatsError('Failed to load statistics. Please try again later.');
            } finally {
                setIsLoadingStats(false);
            }
        };

        fetchUsers();
        fetchActivityLogs();
        fetchStats();
    }, [hasRole]);

    // Handle user creation
    const handleUserCreation = async (userData: { username: string; email: string; password: string; role: string }) => {
        try {
            setUsersError(null);
            await adminService.createAdminUser(userData);

            // Refresh user list
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
            fetchUsers();

            // Close modal
            setShowUserCreationModal(false);
        } catch (error) {
            console.error('Error creating user:', error);
            setUsersError('Failed to create user. Please try again later.');
        }
    };

    // Handle global category creation
    const handleCategoryCreation = async (categoryData: { name: string; description?: string }) => {
        try {
            await adminService.createGlobalCategory(categoryData);
            setShowCategoryModal(false);
            // Refresh category stats
            const updatedCategoryStats = await adminService.getCategoryStats();
            setCategoryStats(updatedCategoryStats);
        } catch (error) {
            console.error('Error creating global category:', error);
            // Error handling will be done in the modal component
            throw error;
        }
    };

    // Format date for display
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleString();
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
                <div className="flex space-x-4">
                    <button
                        onClick={() => setShowUserCreationModal(true)}
                        className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-sky-700 hover:bg-sky-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500"
                    >
                        <UserPlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                        Create Admin/User
                    </button>
                    <button
                        onClick={() => setShowCategoryModal(true)}
                        className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-sky-700 hover:bg-sky-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500"
                    >
                        <FolderPlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                        Create Global Category
                    </button>
                </div>
            </div>

            {/* Statistics Section */}
            <div className="bg-white shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                    <h2 className="text-lg font-medium text-gray-900">Statistics</h2>

                    {isLoadingStats ? (
                        <div className="flex justify-center py-8">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
                        </div>
                    ) : statsError ? (
                        <div className="text-red-500 py-4">{statsError}</div>
                    ) : (
                        <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2">
                            {/* Category Statistics */}
                            <div className="bg-gray-50 overflow-hidden shadow rounded-lg">
                                <div className="px-4 py-5 sm:p-6">
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0 bg-sky-700 rounded-md p-3">
                                            <ShieldCheckIcon className="h-6 w-6 text-white" aria-hidden="true" />
                                        </div>
                                        <div className="ml-5 w-0 flex-1">
                                            <dl>
                                                <dt className="text-sm font-medium text-gray-500 truncate">
                                                    Categories by Password Count
                                                </dt>
                                                <dd>
                                                    <div className="text-lg font-medium text-gray-900">
                                                        {categoryStats.length} Categories
                                                    </div>
                                                </dd>
                                            </dl>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-gray-100 px-4 py-4 sm:px-6">
                                    <div className="max-h-60 overflow-y-auto">
                                        <ul className="divide-y divide-gray-200">
                                            {categoryStats.map((stat, index) => (
                                                <li key={index} className="py-3 flex justify-between">
                                                    <span className="text-sm text-gray-800">{stat.categoryName}</span>
                                                    <span className="text-sm font-medium text-sky-700">{stat.passwordCount} passwords</span>
                                                </li>
                                            ))}
                                            {categoryStats.length === 0 && (
                                                <li className="py-3 text-sm text-gray-500">No categories found</li>
                                            )}
                                        </ul>
                                    </div>
                                </div>
                            </div>

                            {/* Sharing Statistics */}
                            <div className="bg-gray-50 overflow-hidden shadow rounded-lg">
                                <div className="px-4 py-5 sm:p-6">
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0 bg-sky-700 rounded-md p-3">
                                            <ChartBarIcon className="h-6 w-6 text-white" aria-hidden="true" />
                                        </div>
                                        <div className="ml-5 w-0 flex-1">
                                            <dl>
                                                <dt className="text-sm font-medium text-gray-500 truncate">
                                                    Most Shared Categories
                                                </dt>
                                                <dd>
                                                    <div className="text-lg font-medium text-gray-900">
                                                        {sharingStats.length} Categories
                                                    </div>
                                                </dd>
                                            </dl>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-gray-100 px-4 py-4 sm:px-6">
                                    <div className="max-h-60 overflow-y-auto">
                                        <ul className="divide-y divide-gray-200">
                                            {sharingStats.map((stat, index) => (
                                                <li key={index} className="py-3 flex justify-between">
                                                    <span className="text-sm text-gray-800">{stat.categoryName}</span>
                                                    <span className="text-sm font-medium text-sky-700">{stat.shareCount} shares</span>
                                                </li>
                                            ))}
                                            {sharingStats.length === 0 && (
                                                <li className="py-3 text-sm text-gray-500">No sharing data found</li>
                                            )}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Users Section */}
            <div className="bg-white shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                    <h2 className="text-lg font-medium text-gray-900">Users</h2>

                    {isLoadingUsers ? (
                        <div className="flex justify-center py-8">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
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
                                            Created At
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
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.role === 'ADMIN' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
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

            {/* Activity Logs Section */}
            <div className="bg-white shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                    <h2 className="text-lg font-medium text-gray-900">Recent Activity</h2>

                    {isLoadingLogs ? (
                        <div className="flex justify-center py-8">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
                        </div>
                    ) : logsError ? (
                        <div className="text-red-500 py-4">{logsError}</div>
                    ) : (
                        <div className="mt-6 flow-root">
                            <ul className="-my-5 divide-y divide-gray-200">
                                {activityLogs.slice(0, 10).map((log) => (
                                    <li key={log.id} className="py-4">
                                        <div className="flex items-center space-x-4">
                                            <div className="flex-shrink-0">
                                                <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center">
                                                    <ClockIcon className="h-5 w-5 text-primary-600" aria-hidden="true" />
                                                </div>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-gray-900 truncate">
                                                    {log.username}
                                                </p>
                                                <p className="text-sm text-gray-500 truncate">
                                                    {log.action}: {log.details}
                                                </p>
                                            </div>
                                            <div className="flex-shrink-0 text-sm text-gray-500">
                                                {formatDate(log.timestamp)}
                                            </div>
                                        </div>
                                    </li>
                                ))}
                                {activityLogs.length === 0 && (
                                    <li className="py-4 text-center text-sm text-gray-500">
                                        No activity logs found
                                    </li>
                                )}
                            </ul>
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

            {showCategoryModal && (
                <AdminGlobalCategory
                    onSubmit={handleCategoryCreation}
                    onCancel={() => setShowCategoryModal(false)}
                />
            )}
        </div>
    );
};

export default AdminDashboard;
