/**
 * ProtectedRoute is a wrapper for routes that require user authentication.
 * - Shows a loading spinner while authentication state is loading.
 * - Redirects unauthenticated users to the login page.
 * - Renders child routes if authenticated.
 */
import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const ProtectedRoute = () => {
  // Get authentication state from context
  const { isAuthenticated, isLoading } = useAuth()

  // Show loading spinner while authentication is being determined
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  // If not authenticated, redirect to login page
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  // If authenticated, render nested routes
  return <Outlet />
}

export default ProtectedRoute
