import { Link } from 'react-router-dom'
import { ShieldExclamationIcon } from '@heroicons/react/24/outline'

const NotFound = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4 sm:px-6 lg:px-8">
      <ShieldExclamationIcon className="h-16 w-16 text-primary-600 mb-4" />
      <h1 className="text-3xl font-extrabold text-gray-900 text-center">404 - Page Not Found</h1>
      <p className="mt-2 text-center text-lg text-gray-600 max-w-md">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <div className="mt-6">
        <Link
          to="/"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          Go back home
        </Link>
      </div>
    </div>
  )
}

export default NotFound
