import { useState, useRef, useEffect } from 'react'
import { credentialService } from '../services/credentialService'

/**
 * Props for SetupPin component.
 * - onSuccess: optional, called after successful PIN setup.
 * - onSetup: optional, called with PIN when form is submitted (alternative to onSuccess).
 * - onCancel: optional, called when the modal is dismissed/cancelled.
 */
interface SetupPinProps {
  onSuccess?: () => void
  onSetup?: (pin: string) => void
  onCancel?: () => void
}

/**
 * SetupPin is a modal dialog for setting up a new security PIN, a critical security component
 * of the KeyBastion password management system.
 * 
 * The PIN serves as a second layer of security beyond the user's login credentials. It prevents
 * unauthorized access to sensitive password information even if the user's session is compromised
 * or their device is left unattended with an active session. This component:
 * 
 * - Enforces PIN complexity requirements (4-digit numeric PIN)
 * - Requires PIN confirmation to prevent user errors
 * - Implements proper validation with informative error messages
 * - Features accessible UI with keyboard navigation and auto-focus
 * - Securely communicates with the backend security services
 * 
 * This component is displayed when:  
 * 1. A user attempts to view a password but hasn't yet set up a PIN
 * 2. A user manually chooses to set up or change their PIN
 */
const SetupPin = ({ onSuccess, onSetup, onCancel }: SetupPinProps) => {
  // PIN input state (for entry and confirmation)
  const [pin, setPin] = useState<string[]>(['', '', '', ''])
  const [confirmPin, setConfirmPin] = useState<string[]>(['', '', '', ''])
  // Error state
  const [error, setError] = useState<string | null>(null)
  // Submission/loading state
  const [isSettingUp, setIsSettingUp] = useState(false)
  // Refs for each input for focus management
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])
  const confirmInputRefs = useRef<(HTMLInputElement | null)[]>([])

  // Focus the first input when the component mounts
  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus()
    }
  }, [])

  /**
   * Handles changes in PIN and confirm PIN input fields, auto-advances focus, and restricts to digits.
   */
  const handlePinChange = (index: number, value: string, isConfirm: boolean) => {
    // Only allow numbers
    if (value && !/^\d+$/.test(value)) {
      return
    }

    // Update the PIN array
    if (isConfirm) {
      const newPin = [...confirmPin]
      newPin[index] = value
      setConfirmPin(newPin)
      
      // Move focus to the next input if this one is filled
      if (value && index < confirmPin.length - 1) {
        const nextInput = confirmInputRefs.current[index + 1]
        if (nextInput) {
          // Focus the next confirm input field
          nextInput.focus()
        }
      }
    } else {
      const newPin = [...pin]
      newPin[index] = value
      setPin(newPin)
      
      // Move focus to the next input if this one is filled
      if (value && index < pin.length - 1) {
        const nextInput = inputRefs.current[index + 1]
        if (nextInput) {
          // Focus the next PIN input field
          nextInput.focus()
        }
      }
      
      // If we've filled the last digit, move to the confirm section
      if (value && index === pin.length - 1) {
        if (confirmInputRefs.current[0]) {
          // Focus the first confirm input field
          confirmInputRefs.current[0].focus()
        }
      }
    }
  }

  /**
   * Handles keyboard events for PIN and confirm PIN input fields (e.g., backspace for focus).
   */
  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>, isConfirm: boolean) => {
    // Move focus to the previous input on backspace if current input is empty
    if (e.key === 'Backspace' && index > 0) {
      if (isConfirm) {
        if (!confirmPin[index]) {
          const prevInput = confirmInputRefs.current[index - 1]
          if (prevInput) {
            // Focus the previous confirm input field
            prevInput.focus()
          }
        }
      } else {
        if (!pin[index]) {
          const prevInput = inputRefs.current[index - 1]
          if (prevInput) {
            // Focus the previous PIN input field
            prevInput.focus()
          }
        }
      }
    }
  }

  /**
   * Handles submission and validation of PIN setup.
   * Validates PIN entry, confirmation, and triggers API or callback.
   */
  const handleSetupPin = async () => {
    const fullPin = pin.join('')
    const fullConfirmPin = confirmPin.join('')
    
    // Validate full PIN length
    if (fullPin.length < 4) {
      setError('Please enter a complete PIN (4 digits)')
      return
    }
    
    // Validate PIN match
    if (fullPin !== fullConfirmPin) {
      setError('PINs do not match. Please try again.')
      return
    }
    
    try {
      setIsSettingUp(true)
      
      // Use custom onSetup callback if provided, otherwise call API and onSuccess
      if (onSetup) {
        onSetup(fullPin)
      } else if (onSuccess) {
        await credentialService.setSecurityPin(fullPin)
        onSuccess()
      }
    } catch (err: any) {
      console.error('Error setting up PIN:', err)
      // Extract error message from API response if available
      const errorMessage = err?.response?.data?.error || 'Failed to set up PIN. Please try again.'
      setError(errorMessage)
      return // Don't close the modal on error
    } finally {
      setIsSettingUp(false)
    }
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
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Set Up Security PIN</h2>
        <p className="text-gray-600 mb-6">
          Create a 4-digit PIN to access your passwords. You'll need this PIN whenever you want to view a password.
        </p>
        
        {error && (
          <div className="mb-4 text-sm text-red-600">
            {error}
          </div>
        )}
        
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Enter PIN
          </label>
          <div className="flex justify-center space-x-2">
            {pin.map((digit, index) => (
              <input
                key={index}
                ref={(el) => (inputRefs.current[index] = el)}
                type="password"
                value={digit}
                onChange={(e) => handlePinChange(index, e.target.value, false)}
                onKeyDown={(e) => handleKeyDown(index, e, false)}
                maxLength={1}
                className="w-12 h-12 text-center text-xl font-semibold border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
              />
            ))}
          </div>
        </div>
        
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Confirm PIN
          </label>
          <div className="flex justify-center space-x-2">
            {confirmPin.map((digit, index) => (
              <input
                key={index}
                ref={(el) => (confirmInputRefs.current[index] = el)}
                type="password"
                value={digit}
                onChange={(e) => handlePinChange(index, e.target.value, true)}
                onKeyDown={(e) => handleKeyDown(index, e, true)}
                maxLength={1}
                className="w-12 h-12 text-center text-xl font-semibold border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
              />
            ))}
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
            type="button"
            onClick={handleSetupPin}
            disabled={isSettingUp}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
          >
            {isSettingUp ? 'Setting up...' : 'Set PIN'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default SetupPin
