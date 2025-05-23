/**
 * UserRoute is a protected route component for regular user-only pages.
 * It checks if the user is authenticated and is NOT an admin.
 * - Shows a loading spinner while authentication state is loading.
 * - Redirects admins to the admin dashboard.
 * - Redirects unauthenticated users to the login page.
 * - Renders child routes if authenticated as a regular user.
 */
import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const UserRoute = () => {
  // Get authentication and role info from context
  const { isAuthenticated, isLoading, hasRole } = useAuth()

  // Show loading spinner while authentication/role is being determined
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  // If authenticated as admin, redirect to admin dashboard
  if (isAuthenticated && hasRole('ADMIN')) {
    return <Navigate to="/admin" replace />
  }

  // If not authenticated, redirect to login page
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  // If authenticated as a regular user, render nested routes
  return <Outlet />
}

export default UserRoute
