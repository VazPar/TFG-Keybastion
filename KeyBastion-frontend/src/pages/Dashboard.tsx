import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    KeyIcon,
    ShieldCheckIcon,
    ClockIcon,
    ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../context/AuthContext';
import { credentialService, DashboardStats } from '../services/credentialService';
import { activityService, RecentActivity } from '../services/activityService';
import { userService } from '../services/userService';
import PasswordVerification from '../components/PasswordVerification';
import SetupPin from '../components/SetupPin';

// Default data for new users (all zeros)
const defaultStats: DashboardStats = {
    totalPasswords: 0,
    strongPasswords: 0,
    recentlyAdded: 0,
    needsAttention: 0
};

const Dashboard = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState<DashboardStats>(defaultStats);
    const [activities, setActivities] = useState<RecentActivity[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingActivities, setIsLoadingActivities] = useState(true);
    const [isInitialActivitiesLoad, setIsInitialActivitiesLoad] = useState(true);

    // PIN management states
    const [hasPin, setHasPin] = useState<boolean | null>(null);
    const [showPasswordVerification, setShowPasswordVerification] = useState(false);
    const [showSetupPin, setShowSetupPin] = useState(false);
    const [passwordError, setPasswordError] = useState<string | null>(null);
    const [pinSuccess, setPinSuccess] = useState<string | null>(null);
    const [verifiedPassword, setVerifiedPassword] = useState<string | null>(null);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    useEffect(() => {
        // Fetch dashboard data from the API
        const fetchDashboardData = async () => {
            try {
                setIsLoading(true);
                console.log('Fetching dashboard stats...');

                const response = await credentialService.getDashboardStats();
                console.log('Dashboard API response:', response);

                if (response && typeof response === 'object') {
                    setStats({
                        totalPasswords: Number(response.totalPasswords || 0),
                        strongPasswords: Number(response.strongPasswords || 0),
                        recentlyAdded: Number(response.recentlyAdded || 0),
                        needsAttention: Number(response.needsAttention || 0)
                    });
                } else {
                    console.warn('Invalid dashboard stats response, using default zeros');
                    setStats(defaultStats);
                }

                setIsLoading(false);
            } catch (error) {
                console.error('Error fetching dashboard data:', error);
                // Fallback to default zeros if API fails
                setStats(defaultStats);
                setIsLoading(false);
            }
        };

        // Fetch recent activities
        const fetchRecentActivities = async () => {
            try {
                // Only set spinner on initial load
                if (isInitialActivitiesLoad) {
                    setIsLoadingActivities(true);
                }
                console.log('Fetching recent activities...');

                const recentActivities = await activityService.getRecentActivities(3);
                console.log('Recent activities:', recentActivities);

                if (!Array.isArray(recentActivities)) {
                    console.warn('API response is not an array:', recentActivities);
                    setActivities([]);
                    return;
                }

                if (recentActivities.length === 0) {
                    console.log('No recent activities found.');
                }

                setActivities(recentActivities);
                if (isInitialActivitiesLoad) {
                    setIsLoadingActivities(false);
                }
            } catch (error) {
                console.error('Error fetching recent activities:', error);
                setActivities([]);
                setIsLoadingActivities(false);
            }
        };

        // Check if user has a PIN set up
        const checkUserPin = async () => {
            try {
                const response = await userService.hasSecurityPin();
                setHasPin(response.hasPin);
            } catch (error) {
                console.error('Error checking PIN status:', error);
                setHasPin(false);
            }
        };
        console.log('useEffect hook triggered.  Calling fetchDashboardData(), fetchRecentActivities(), and checkUserPin().');
        fetchDashboardData();
        fetchRecentActivities();
        checkUserPin();

        // Poll for recent activities every 10 seconds
        const interval = setInterval(() => {
            setIsInitialActivitiesLoad(false);
            fetchRecentActivities();
        }, 10000);
        return () => clearInterval(interval);
    }, [refreshTrigger]);

    // Handle password verification for PIN management
    const handlePasswordVerify = async (password: string) => {
        try {
            const response = await userService.verifyPassword(password);
            if (response && response.valid) {
                setShowPasswordVerification(false);
                setShowSetupPin(true);
                setPasswordError(null);
                setVerifiedPassword(password);
            } else {
                setPasswordError('Invalid password. Please try again.');
            }
        } catch (error: any) {
            console.error('Password verification error:', error);
            const errorMessage = error?.response?.data?.error || 'Invalid password. Please try again.';
            setPasswordError(errorMessage);
        }
    };

    const handleSetupPin = async (pin: string) => {
        if (!verifiedPassword) {
            console.error('No verified password available');
            setShowSetupPin(false);
            setPasswordError('Authentication error. Please try again.');
            setShowPasswordVerification(true);
            return;
        }

        try {
            // Call the API to set the security PIN
            const setPinResponse = await userService.setSecurityPin(pin, verifiedPassword);

            if (setPinResponse && setPinResponse.message && setPinResponse.message.includes('Security PIN set successfully')) {
                setShowSetupPin(false);
                setHasPin(true);
                setPinSuccess('Your security PIN has been set successfully.');
                setTimeout(() => {
                    setPinSuccess(null);
                }, 5000);
                // Refresh the data to reflect the new PIN status
                refreshDashboard();
            }
            else {
                // Show backend error if present
                throw new Error(setPinResponse && setPinResponse.message ? setPinResponse.message : 'Failed to set PIN.');
            }

        } catch (error: any) {
            console.error('Error setting up PIN:', error);

            // If it's an authentication error, go back to password verification
            if (error?.response?.status === 401) {
                setShowSetupPin(false);
                setPasswordError('Your session has expired or password is incorrect. Please verify again.');
                setShowPasswordVerification(true);
            } else {
                // For other errors, show a generic message
                setPinSuccess(null);
                const errorMessage = error?.response?.data?.error || 'Failed to set PIN. Please try again.';
                setPasswordError(errorMessage);
            }
        } finally {
            setVerifiedPassword(null); // Clear the stored password for security
        }
    };


    // Handle PIN management button click
    const handleManagePin = () => {
        setPasswordError(null);
        setShowPasswordVerification(true);
    };

    //Dasboard Refresh Trigger
    const refreshDashboard = () => {
        setRefreshTrigger(prev => prev + 1);
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
                <span className="inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium bg-sky-100 text-sky-800">
                    Welcome, {user?.username}!
                </span>
            </div>

            {/* Stats cards */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {/* Total passwords */}
                <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="p-5">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <KeyIcon className="h-6 w-6 text-sky-700" aria-hidden="true" />
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="text-sm font-medium text-gray-500 truncate">Total Passwords</dt>
                                    <dd>
                                        <div className="text-lg font-medium text-gray-900">{stats.totalPasswords}</div>
                                    </dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                    <div className="bg-gray-50 px-5 py-3">
                        <div className="text-sm">
                            <Link to="/passwords" className="font-medium text-sky-700 hover:text-sky-600">
                                View all passwords
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Strong passwords */}
                <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="p-5">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <ShieldCheckIcon className="h-6 w-6 text-sky-700" aria-hidden="true" />
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="text-sm font-medium text-gray-500 truncate">Strong Passwords</dt>
                                    <dd>
                                        <div className="text-lg font-medium text-gray-900">{stats.strongPasswords}</div>
                                    </dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                    <div className="bg-gray-50 px-5 py-3">
                        <div className="text-sm">
                            <Link to="/password-generator" className="font-medium text-sky-700 hover:text-sky-600">
                                Generate strong password
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Recently added */}
                <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="p-5">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <ClockIcon className="h-6 w-6 text-sky-700" aria-hidden="true" />
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="text-sm font-medium text-gray-500 truncate">Recently Added</dt>
                                    <dd>
                                        <div className="text-lg font-medium text-gray-900">{stats.recentlyAdded}</div>
                                    </dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                    <div className="bg-gray-50 px-5 py-3">
                        <div className="text-sm">
                            <Link to="/passwords" className="font-medium text-sky-700 hover:text-sky-600">
                                View recent passwords
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Needs attention */}
                <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="p-5">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <ExclamationTriangleIcon className="h-6 w-6 text-sky-700" aria-hidden="true" />
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="text-sm font-medium text-gray-500 truncate">Needs Attention</dt>
                                    <dd>
                                        <div className="text-lg font-medium text-gray-900">{stats.needsAttention}</div>
                                    </dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                    <div className="bg-gray-50 px-5 py-3">
                        <div className="text-sm">
                            <Link to="/passwords" className="font-medium text-sky-700 hover:text-sky-600">
                                View weak passwords
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Activity section */}
            <div className="bg-white shadow rounded-lg">
                <div className="px-4 py-5 sm:px-6">
                    <h2 className="text-lg font-medium text-gray-900">Recent Activity</h2>
                    <p className="mt-1 text-sm text-gray-500">
                        Your recent password management activities
                    </p>
                </div>
                <div className="border-t border-gray-200">
                    <div className="px-4 py-5 sm:p-6">
                        {isLoadingActivities ? (
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
                        ) : (
                            activities.length > 0 ? (
                                <div className="space-y-4">
                                    {activities.map((activity, index) => (
                                        <div key={index} className="flex items-start">
                                            <div className="flex-shrink-0">
                                                <KeyIcon className="h-5 w-5 text-gray-400" />
                                            </div>
                                            <div className="ml-3 flex-1">
                                                <p className="text-sm text-gray-900">
                                                    {activity.details}
                                                    <span className="font-medium text-gray-500"> • {activity.timeAgo}</span>
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-6">
                                    <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-gray-100">
                                        <ClockIcon className="h-6 w-6 text-gray-400" aria-hidden="true" />
                                    </div>
                                    <h3 className="mt-3 text-sm font-medium text-gray-900">No activity yet</h3>
                                    <p className="mt-2 text-sm text-gray-500">
                                        Start adding passwords to see your activity here.
                                    </p>
                                    <div className="mt-6">
                                        <Link
                                            to="/password-generator"
                                            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-sky-700 hover:bg-sky-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500"
                                        >
                                            <KeyIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                                            Add your first password
                                        </Link>
                                    </div>
                                </div>
                            )
                        )}
                    </div>
                </div>
            </div>

            {/* PIN management section */}
            <div className="bg-white shadow rounded-lg">
                <div className="px-4 py-5 sm:px-6">
                    <h2 className="text-lg font-medium text-gray-900">PIN Management</h2>
                    <p className="mt-1 text-sm text-gray-500">
                        Manage your PIN for added security
                    </p>
                </div>
                <div className="border-t border-gray-200">
                    <div className="px-4 py-5 sm:p-6">
                        {hasPin === null ? (
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
                        ) : hasPin ? (
                            <div>
                                <p className="text-sm text-gray-500">You have a PIN set up.</p>
                                <button
                                    className="inline-flex items-center justify-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-sky-700 hover:bg-sky-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500"
                                    onClick={handleManagePin}
                                >
                                    Manage PIN
                                </button>
                            </div>
                        ) : (
                            <div>
                                <p className="text-sm text-gray-500">You don't have a PIN set up.</p>
                                <button
                                    className="inline-flex items-center justify-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-sky-700 hover:bg-sky-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500"
                                    onClick={handleManagePin}
                                >
                                    Set up PIN
                                </button>
                            </div>
                        )}
                        {showPasswordVerification && (
                            <PasswordVerification
                                onVerify={handlePasswordVerify}
                                errorMessage={passwordError}
                                onCancel={() => setShowPasswordVerification(false)}
                            />
                        )}
                        {showSetupPin && (
                            <SetupPin
                                onSetup={handleSetupPin}
                                onCancel={() => setShowSetupPin(false)}
                            />
                        )}
                        {pinSuccess && (
                            <p className="text-sm text-green-500">{pinSuccess}</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Quick actions */}
            <div className="bg-white shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                    <h3 className="text-lg font-medium leading-6 text-gray-900">Quick Actions</h3>
                    <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                            <Link
                                to="/password-generator"
                                className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-sky-700 hover:bg-sky-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 w-full"
                            >
                                Generate New Password
                            </Link>
                        </div>
                        <div>
                            <Link
                                to="/passwords/add"
                                className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 w-full"
                            >
                                Add Existing Password
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
