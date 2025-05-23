/**
 * REFACTORING RECOMMENDATION:
 * This component has grown to ~550 lines and handles multiple responsibilities.
 * Consider refactoring it by splitting into these more focused components:
 * 
 * 1. PasswordsList - Rendering the list of passwords with its UI logic
 * 2. PasswordDetail - Showing the detailed view of a selected password
 * 3. PasswordActions - Handling actions like delete, share, view
 * 4. usePasswordsLogic - A custom hook containing most of the state logic
 * 
 * This separation would improve:
 * - Maintainability: Smaller components are easier to understand and modify
 * - Performance: More granular re-rendering with proper component boundaries
 * - Testability: Focused components are easier to test in isolation
 * - Code organization: Following the Single Responsibility Principle
 */

import { useState, useEffect, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
    KeyIcon,
    EyeIcon,
    PencilIcon,
    TrashIcon,
    PlusIcon,
    LockClosedIcon,
    ShareIcon,
    CheckCircleIcon,
    XCircleIcon,
    ClockIcon,
    ClipboardDocumentIcon,
    ArrowPathIcon
} from '@heroicons/react/24/outline'
import { credentialService, CredentialsResponse } from '../services/credentialService'
import { sharingService } from '../services/sharingService'
import PinVerification from '../components/PinVerification'
import SetupPin from '../components/SetupPin'
import ShareCredentialModal from '../components/ShareCredentialModal'

/**
 * Passwords component - Main credential management interface for users
 * 
 * Provides a comprehensive interface for managing stored credentials including:
 * - Viewing a list of all saved passwords
 * - Accessing credential details with secure password reveal functionality
 * - Sharing credentials with other users
 * - Editing and deleting credentials with appropriate confirmations
 * - PIN-based security for accessing sensitive information
 * 
 * The component handles multiple security workflows including:
 * - PIN verification before revealing passwords
 * - PIN setup for users who haven't created one
 * - Confirmation dialogs for actions that affect shared credentials
 * - Password visibility toggle with appropriate security considerations
 */
const Passwords = () => {
    const navigate = useNavigate()
    // Core data and loading states
    const [credentials, setCredentials] = useState<CredentialsResponse['ownCredentials']>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isRefreshing, setIsRefreshing] = useState(false)
    
    // Error and success message handling
    const [error, setError] = useState<string | null>(null)
    const [successMessage, setSuccessMessage] = useState<string | null>(null)
    const [pinError, setPinError] = useState<string | null>(null)
    
    // Deletion confirmation states
    const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)
    const [sharedPasswordConfirm, setSharedPasswordConfirm] = useState<{id: string, message: string} | null>(null)
    
    // Modal visibility states
    const [showPinVerification, setShowPinVerification] = useState(false)
    const [showSetupPin, setShowSetupPin] = useState(false)
    const [showShareModal, setShowShareModal] = useState(false)
    
    // Credential and password handling states
    const [selectedCredentialId, setSelectedCredentialId] = useState<string | null>(null)
    const [decryptedPassword, setDecryptedPassword] = useState<string | null>(null)
    const [showPassword, setShowPassword] = useState(false) // Controls password visibility toggle
    // Note: isRefreshing and sharedPasswordConfirm are already defined above

    const fetchCredentials = useCallback(async () => {
        try {
            setIsLoading(true)
            const data = await credentialService.getCredentials()
            setCredentials(data.ownCredentials)
            setError(null)
        } catch (err) {
            console.error('Error fetching credentials:', err)
            setError('Failed to load your passwords. Please try again.')
        } finally {
            setIsLoading(false)
            setIsRefreshing(false)
        }
    }, [])

    useEffect(() => {
        fetchCredentials()
    }, [fetchCredentials])

    const refreshData = () => {
        setIsRefreshing(true)
        fetchCredentials()
    }

    const handleViewPassword = (id: string) => {
        setSelectedCredentialId(id)
        setShowPinVerification(true)
    }

    const handleEditPassword = (id: string) => {
        navigate(`/edit-password/${id}`)
    }

    /**
     * Handles the deletion of a password credential with special handling for shared passwords.
     * 
     * This method implements a two-phase deletion process:
     * 1. First click: Sets the credential for deletion confirmation (sets deleteConfirmId)
     * 2. Second click: Performs the actual deletion after confirmation
     * 
     * For shared passwords, it implements an additional confirmation flow that ensures
     * users understand the implications of deleting a shared password:
     * - On deletion attempt of a shared password, the backend returns a 409 Conflict
     * - The frontend presents a specific confirmation message about sharing implications
     * - User must explicitly confirm to delete a shared password
     * - When confirmed, credential is deleted along with all of its sharing entries
     * 
     * The method handles several edge cases:
     * - Regular (non-shared) password deletion
     * - Shared password deletion with proper confirmation
     * - Error handling with user-friendly messages
     * - Cleanup of UI state after successful operations
     * 
     * @param id - The unique identifier of the credential to be deleted
     */
    const handleDeletePassword = async (id: string) => {
        if (deleteConfirmId === id) {
            try {
                // If we already have a shared password confirmation, proceed with deletion
                // The true parameter signals to the backend this is a confirmed shared password deletion
                if (sharedPasswordConfirm && sharedPasswordConfirm.id === id) {
                    await credentialService.deleteCredential(id, true)
                    setCredentials(prev => prev.filter(cred => cred.id !== id))
                    setDeleteConfirmId(null)
                    setSharedPasswordConfirm(null)
                    setSuccessMessage('Password and all its shares deleted successfully')
                } else {
                    // Regular password deletion (not shared or already confirmed)
                    await credentialService.deleteCredential(id)
                    setCredentials(prev => prev.filter(cred => cred.id !== id))
                    setDeleteConfirmId(null)
                    setSuccessMessage('Password deleted successfully')
                }
                setTimeout(() => setSuccessMessage(null), 3000)
            } catch (err: any) {
                console.error('Error deleting credential:', err)
                
                // Special handling for shared passwords requiring confirmation
                if (err.response?.status === 409 && err.response?.data?.requiresConfirmation) {
                    // Set state for special shared password confirmation dialog
                    setSharedPasswordConfirm({
                        id,
                        message: err.response.data.warning || 'This password is currently shared. Deleting it will revoke access for all shared users. Do you want to proceed?'
                    })
                } else if (err.response?.status === 500) {
                    // Handle specific backend errors with more detailed messages
                    const errorDetails = err.response?.data?.details || '';
                    const errorMessage = err.response?.data?.error || 'Server error occurred';
                    
                    // If it's a TransientObjectException, provide a more helpful message
                    if (errorDetails.includes('TransientObjectException') || 
                        errorDetails.includes('detached entity')) {
                        console.error('Detected entity relationship error during deletion:', errorDetails);
                        setError('A database relationship error occurred. Please refresh the page and try again.');
                    } else {
                        // Log the specific error for troubleshooting
                        console.error(`Server error (${errorDetails}):`, errorMessage);
                        setError(`Failed to delete password: ${errorMessage}`);
                    }
                } else {
                    // General error handling
                    setError('Failed to delete password. Please try again.')
                }
            }
        } else {
            // First click - set up for confirmation
            setDeleteConfirmId(id)
            // Reset any previous shared confirmation
            setSharedPasswordConfirm(null)
        }
    }

    /**
     * Handles PIN verification and password decryption
     * 
     * This method is called when a user submits their PIN in the verification dialog.
     * It manages several important security flows:
     * 1. Verifies the PIN with the backend API
     * 2. Displays the decrypted password if PIN is correct
     * 3. Handles PIN errors with appropriate user feedback
     * 4. Detects when a user needs to set up a PIN and transitions to PIN setup flow
     * 
     * @param pin - The 4-digit PIN entered by the user
     */
    const handlePinVerify = async (pin: string) => {
        try {
            setPinError(null)
            if (selectedCredentialId) {
                const result = await credentialService.verifyPinAndGetPassword(selectedCredentialId, pin)
                setDecryptedPassword(result.password)
                setSuccessMessage('Password decrypted successfully')
                setTimeout(() => setSuccessMessage(null), 3000)
            }
            setShowPinVerification(false)
        } catch (err: any) {
            console.error('Error verifying PIN:', err)
            if (err.response?.status === 401) {
                // PIN is incorrect
                setPinError('Invalid PIN. Please try again.')
            } else if (err.response?.status === 403 && err.response.data?.needsPin) {
                // User doesn't have a PIN set - transition to PIN setup flow
                setShowPinVerification(false)
                setShowSetupPin(true)
            } else if (err.response?.status === 400 && err.response.data?.error?.includes('set a security PIN')) {
                // Legacy condition for backward compatibility with older API versions
                setShowPinVerification(false)
                setShowSetupPin(true)
            } else {
                // Generic error handling
                setPinError('Failed to verify PIN. Please try again.')
            }
        }
    }

    const handlePinCancel = () => {
        setShowPinVerification(false)
        setPinError(null)
    }

    const handleSetupPin = async (pin: string) => {
        try {
            await credentialService.setSecurityPin(pin)
            setShowSetupPin(false)
            setSuccessMessage('PIN set up successfully!')
            setTimeout(() => setSuccessMessage(null), 3000)
        } catch (err: any) {
            console.error('Error setting up PIN:', err)
            setError(err?.response?.data?.error || 'Failed to set up PIN. Please try again.')
        }
    }

    const handleSharePassword = (id: string) => {
        setSelectedCredentialId(id)
        setShowShareModal(true)
    }

    const handleShareSubmit = async (userId: string, securityPin: string) => {
        if (!selectedCredentialId) return

        try {
            const request = {
                credentialId: selectedCredentialId,
                sharedWithUserId: userId,
                securityPin: securityPin
            }

            await sharingService.shareCredential(request)
            setShowShareModal(false)
            setSuccessMessage(`Password shared successfully with user ID: ${userId.substring(0, 8)}...`)
            setTimeout(() => setSuccessMessage(null), 5000)
        } catch (err: any) {
            console.error('Error sharing credential:', err)
            setError(err.response?.data?.error || 'Failed to share password. Please try again.')
        }
    }

    const handleShareCancel = () => {
        setShowShareModal(false)
        setSelectedCredentialId(null)
    }

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text)
        setSuccessMessage('Copied to clipboard!')
        setTimeout(() => setSuccessMessage(null), 2000)
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString()
    }

    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
            </div>
        )
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Your Passwords</h1>
                <div className="flex items-center space-x-4">
                    <button
                        onClick={refreshData}
                        disabled={isRefreshing}
                        className="p-2 text-gray-600 hover:text-gray-900 disabled:opacity-50"
                        title="Refresh data"
                    >
                        <ArrowPathIcon className={`h-5 w-5 ${isRefreshing ? 'animate-spin' : ''}`} />
                    </button>
                    <Link
                        to="/password-generator"
                        className="flex items-center bg-sky-700 hover:bg-sky-800 text-white px-4 py-2 rounded-md"
                    >
                        <PlusIcon className="h-5 w-5 mr-2" />
                        Add New Password
                    </Link>
                </div>
            </div>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 flex items-center">
                    <XCircleIcon className="h-5 w-5 mr-2" />
                    {error}
                </div>
            )}

            {successMessage && (
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4 flex items-center">
                    <CheckCircleIcon className="h-5 w-5 mr-2" />
                    {successMessage}
                </div>
            )}

            {credentials.length === 0 ? (
                <div className="text-center py-12">
                    <KeyIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-lg font-medium text-gray-900">No passwords found</h3>
                    <p className="mt-1 text-sm text-gray-500">Get started by creating a new password.</p>
                    <div className="mt-6">
                        <Link
                            to="/password-generator"
                            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-sky-700 hover:bg-sky-800"
                        >
                            <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
                            Add New Password
                        </Link>
                    </div>
                </div>
            ) : (
                <div className="bg-white shadow overflow-hidden sm:rounded-md">
                    <ul className="divide-y divide-gray-200">
                        {credentials.map((credential) => (
                            <li key={credential.id}>
                                <div className="px-4 py-4 sm:px-6">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center bg-primary-100 rounded-full">
                                                <KeyIcon className="h-6 w-6 text-primary-600" />
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-gray-900">{credential.accountName}</div>
                                                <div className="text-sm text-gray-500">{credential.serviceUrl}</div>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <button
                                                onClick={() => handleViewPassword(credential.id)}
                                                className="inline-flex items-center px-2.5 py-1.5 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50"
                                            >
                                                <EyeIcon className="h-4 w-4 mr-1" />
                                                View
                                            </button>

                                            <button
                                                onClick={() => handleEditPassword(credential.id)}
                                                className="inline-flex items-center px-2.5 py-1.5 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50"
                                            >
                                                <PencilIcon className="h-4 w-4 mr-1" />
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleSharePassword(credential.id)}
                                                className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-blue-600 hover:bg-blue-700"
                                            >
                                                <ShareIcon className="h-4 w-4 mr-1" />
                                                Share
                                            </button>
                                            <button
                                                onClick={() => handleDeletePassword(credential.id)}
                                                className={`inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded ${deleteConfirmId === credential.id
                                                    ? 'text-white bg-red-800 hover:bg-red-900'
                                                    : 'text-white bg-red-600 hover:bg-red-700'
                                                    }`}
                                            >
                                                <TrashIcon className="h-4 w-4 mr-1" />
                                                {deleteConfirmId === credential.id ? 'Confirm' : 'Delete'}
                                            </button>
                                        </div>
                                    </div>

                                    <div className="mt-2 flex items-center text-sm text-gray-500">
                                        <div className="flex items-center mr-4">
                                            <ClockIcon className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                                            Created: {formatDate(credential.createdAt)}
                                        </div>
                                        {credential.category && (
                                            <div className="flex items-center">
                                                <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                                                    {credential.category.name}
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    {selectedCredentialId === credential.id && (
                                        <div className="mt-4 p-4 bg-gray-50 rounded-md">
                                            <h4 className="text-sm font-medium text-gray-900 mb-2">Credential Details</h4>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                                                <div>
                                                    <p className="text-xs text-gray-500">Account Name:</p>
                                                    <p className="font-medium">{credential.accountName}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-500">Service URL:</p>
                                                    <p className="font-medium">{credential.serviceUrl}</p>
                                                </div>
                                                {credential.notes && (
                                                    <div className="sm:col-span-2">
                                                        <p className="text-xs text-gray-500">Notes:</p>
                                                        <p className="whitespace-pre-wrap">{credential.notes}</p>
                                                    </div>
                                                )}
                                                <div className="sm:col-span-2">
                                                    <p className="text-xs text-gray-500">Password:</p>
                                                    {decryptedPassword ? (
                                                        <div className="flex items-center">
                                                            <div className="relative flex-grow">
                                                                <input
                                                                    type={showPassword ? "text" : "password"}
                                                                    value={decryptedPassword}
                                                                    readOnly
                                                                    className="font-mono bg-gray-100 p-2 rounded w-full pr-10"
                                                                />
                                                                <button
                                                                    onClick={() => setShowPassword(!showPassword)}
                                                                    type="button"
                                                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
                                                                    title={showPassword ? "Hide password" : "Show password"}
                                                                >
                                                                    {showPassword ? (
                                                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
                                                                        </svg>
                                                                    ) : (
                                                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                                                                        </svg>
                                                                    )}
                                                                </button>
                                                            </div>
                                                            <button
                                                                onClick={() => copyToClipboard(decryptedPassword)}
                                                                className="ml-2 p-1 text-gray-500 hover:text-gray-700"
                                                                title="Copy to clipboard"
                                                            >
                                                                <ClipboardDocumentIcon className="h-5 w-5" />
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex items-center">
                                                                <LockClosedIcon className="h-5 w-5 mr-1 text-gray-400" />
                                                                <span className="text-gray-500">Password is protected</span>
                                                            </div>
                                                            <button
                                                                onClick={() => handleViewPassword(credential.id)}
                                                                className="inline-flex items-center px-3 py-1.5 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                                                            >
                                                                <EyeIcon className="h-4 w-4 mr-1" />
                                                                View Password
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-500">Created:</p>
                                                    <p className="font-medium">{formatDate(credential.createdAt)}</p>
                                                </div>
                                                {credential.category && (
                                                    <div>
                                                        <p className="text-xs text-gray-500">Category:</p>
                                                        <p className="font-medium">{credential.category.name}</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {showPinVerification && (
                <PinVerification
                    onVerify={handlePinVerify}
                    onCancel={handlePinCancel}
                    errorMessage={pinError}
                    action="View Password"
                />
            )}

            {showSetupPin && (
                <SetupPin
                    onSetup={handleSetupPin}
                    onCancel={() => setShowSetupPin(false)}
                />
            )}

            {showShareModal && (
                <ShareCredentialModal
                    onSubmit={handleShareSubmit}
                    onCancel={handleShareCancel}
                />
            )}

            {/* Shared password deletion confirmation modal */}
            {sharedPasswordConfirm && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-xl">
                        <h2 className="text-xl font-semibold text-gray-800 mb-4">
                            Confirm Deletion
                        </h2>
                        <p className="text-gray-600 mb-6">
                            {sharedPasswordConfirm.message}
                        </p>
                        <div className="flex justify-end space-x-3">
                            <button
                                onClick={() => setSharedPasswordConfirm(null)}
                                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded text-gray-800 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => handleDeletePassword(sharedPasswordConfirm.id)}
                                className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded text-white transition-colors"
                            >
                                Delete Password & Shares
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default Passwords
