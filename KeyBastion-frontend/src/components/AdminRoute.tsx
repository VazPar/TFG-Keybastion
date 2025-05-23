/**
 * AdminRoute is a protected route component for admin-only pages.
 * It checks if the user is authenticated and has the 'ADMIN' role.
 * - Shows a loading spinner while authentication state is loading.
 * - Redirects non-admins or unauthenticated users to the dashboard.
 * - Renders child routes if authenticated as admin.
 */
import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const AdminRoute = () => {
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

  // If not authenticated or not an admin, redirect to user dashboard
  if (!isAuthenticated || !hasRole('ADMIN')) {
    return <Navigate to="/dashboard" replace />
  }

  // If authenticated and admin, render nested routes
  return <Outlet />
}

export default AdminRoute
