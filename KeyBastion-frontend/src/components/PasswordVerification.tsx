import { useState, useEffect } from 'react'
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline'

/**
 * Props for PasswordVerification component.
 * - onVerify: called with password when form is submitted and passes validation.
 * - onCancel: optional, called when the modal is dismissed/cancelled.
 * - errorMessage/error: optional, error messages to display.
 */
interface PasswordVerificationProps {
  onVerify: (password: string) => void
  onCancel?: () => void
  errorMessage?: string | null
  error?: string | null
}

/**
 * PasswordVerification is a modal dialog for verifying the user's password.
 * Handles password input, optional error display, and password visibility toggle.
 */
const PasswordVerification = ({ onVerify, onCancel, errorMessage, error }: PasswordVerificationProps) => {
  // Password input state
  const [password, setPassword] = useState('')
  // Show/hide password state
  const [showPassword, setShowPassword] = useState(false)
  // Local error state (syncs with props)
  const [localError, setLocalError] = useState<string | null>(errorMessage || error || null)
  
  useEffect(() => {
    setLocalError(errorMessage || error || null)
  }, [errorMessage, error])

  /**
   * Handles form submission, including validation and calling onVerify.
   */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate password presence
    if (!password) {
      setLocalError('Please enter your password')
      return
    }
    
    // Call parent handler
    onVerify(password)
  }

  /**
   * Handles cancel button click (if provided).
   */
  const handleCancel = () => {
    if (onCancel) {
      onCancel()
    }
  }

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Verify Your Password</h2>
        <p className="text-gray-600 mb-6">
          For security reasons, please enter your password to continue.
        </p>
        
        {localError && (
          <div className="mb-4 text-sm text-red-600">
            {localError}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <div className="relative rounded-md shadow-sm">
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full pr-10 border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                placeholder="Enter your password"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-500"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeSlashIcon className="h-5 w-5" aria-hidden="true" />
                ) : (
                  <EyeIcon className="h-5 w-5" aria-hidden="true" />
                )}
              </button>
            </div>
          </div>
          
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={handleCancel}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Verify
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default PasswordVerification
