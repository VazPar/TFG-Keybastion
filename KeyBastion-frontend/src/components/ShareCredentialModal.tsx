import { useState, useEffect } from 'react'
import { XMarkIcon, UserIcon, LockClosedIcon } from '@heroicons/react/24/outline'
import { sharingService } from '../services/sharingService'

/**
 * Props for ShareCredentialModal component.
 * - onSubmit: called with userId and securityPin when form is submitted and passes validation.
 * - onCancel: called when the modal is dismissed/cancelled.
 */
interface ShareCredentialModalProps {
  onSubmit: (userId: string, securityPin: string) => void
  onCancel: () => void
}

/**
 * ShareCredentialModal is a modal dialog for sharing a credential with another user.
 * Handles user info fetch, form state, validation, and submission.
 */
const ShareCredentialModal = ({ onSubmit, onCancel }: ShareCredentialModalProps) => {
  // Form state
  const [userId, setUserId] = useState('')
  const [securityPin, setSecurityPin] = useState('')
  const [error, setError] = useState<string | null>(null)
  // Current user info (for display)
  const [currentUserInfo, setCurrentUserInfo] = useState<{ id: string; username: string; hasPinSetup: boolean } | null>(null)
  // Loading state for fetching user info
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    // Fetch current user sharing info when component mounts
    const fetchCurrentUserInfo = async () => {
      try {
        setIsLoading(true)
        const userInfo = await sharingService.getCurrentUserSharingInfo()
        setCurrentUserInfo(userInfo)
      } catch (err) {
        console.error('Error fetching user sharing info:', err)
        setError('Failed to load user information. Please try again.')
      } finally {
        setIsLoading(false)
      }
    }

    fetchCurrentUserInfo()
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate user ID presence
    if (!userId) {
      setError('Please enter a user ID')
      return
    }

    // Validate security PIN presence
    if (!securityPin) {
      setError('Please enter your security PIN')
      return
    }

    // Validate UUID format for user ID
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(userId)) {
      setError('Please enter a valid user ID')
      return
    }

    // Call parent handler
    onSubmit(userId, securityPin)
  }

  return (
    // Modal dialog for sharing a credential
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50">
      <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-medium text-gray-900">Share Password</h3>
          {/* Close button */}
          <button
            type="button"
            className="text-gray-400 hover:text-gray-500"
            onClick={onCancel}
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6">
          {isLoading ? (
            <div className="flex justify-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-sky-600"></div>
            </div>
          ) : (
            <>
              {/* Display current user info for sharing */}
              {currentUserInfo && (
                <div className="mb-6 p-4 bg-blue-50 rounded-md">
                  <div className="flex items-center">
                    <UserIcon className="h-5 w-5 text-blue-500 mr-2" />
                    <h4 className="text-sm font-medium text-blue-800">Your Sharing Information</h4>
                  </div>
                  <p className="mt-2 text-sm text-blue-700">
                    Your User ID: <span className="font-mono bg-blue-100 px-1 py-0.5 rounded">{currentUserInfo.id}</span>
                  </p>
                  <p className="mt-1 text-sm text-blue-700">
                    Your Username: <span className="font-medium">{currentUserInfo.username}</span>
                  </p>
                  <p className="mt-3 text-xs text-blue-600">
                    Share your User ID with others so they can share passwords with you.
                  </p>
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label htmlFor="userId" className="block text-sm font-medium text-gray-700 mb-1">
                    User ID to share with
                  </label>
                  <input
                    type="text"
                    id="userId"
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500 sm:text-sm"
                    value={userId}
                    onChange={(e) => setUserId(e.target.value)}
                    placeholder="Enter the user ID"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Enter the User ID of the person you want to share this password with.
                  </p>
                </div>

                <div className="mb-4">
                  <label htmlFor="securityPin" className="block text-sm font-medium text-gray-700 mb-1">
                    <div className="flex items-center">
                      <LockClosedIcon className="h-4 w-4 mr-1 text-gray-500" />
                      Your Security PIN
                    </div>
                  </label>
                  <input
                    type="password"
                    id="securityPin"
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500 sm:text-sm"
                    value={securityPin}
                    onChange={(e) => setSecurityPin(e.target.value)}
                    placeholder="Enter your security PIN"
                    maxLength={6}
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Enter your security PIN to verify your identity.
                  </p>
                </div>

                {error && (
                  <div className="mb-4 p-2 bg-red-50 border border-red-200 rounded-md">
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                )}

                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    type="button"
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2"
                    onClick={onCancel}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-sky-700 border border-transparent rounded-md text-sm font-medium text-white hover:bg-sky-800 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 shadow-sm"
                  >
                    Share Password
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default ShareCredentialModal
