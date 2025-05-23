import { useState, useRef, useEffect } from 'react'

/**
 * Props for PinVerification component.
 * - onVerify: called with PIN when form is submitted and passes validation.
 * - onCancel: called when the modal is dismissed/cancelled.
 * - errorMessage: optional, error message to display.
 * - action: optional, description of the action being performed (e.g., "View Password").
 */
interface PinVerificationProps {
  onVerify: (pin: string) => void
  onCancel: () => void
  errorMessage?: string | null
  action?: string
}

/**
 * PinVerification is a modal dialog component for securely verifying the user's security PIN.
 * 
 * This component is used throughout the application when accessing sensitive information like
 * stored passwords. It features a 4-digit PIN input with enhanced UX including:
 * - Auto-focus and auto-advance between PIN digits
 * - Keyboard navigation support (including backspace handling)
 * - Input validation with error handling 
 * - Accessibility considerations
 * - Support for custom action descriptions
 * 
 * When a user doesn't have a PIN set, the backend returns a specific error code which triggers
 * the PIN setup flow in the parent component.
 */
const PinVerification = ({ onVerify, onCancel, errorMessage, action = 'Verify' }: PinVerificationProps) => {
  // PIN input state (array for each digit)
  const [pin, setPin] = useState<string[]>(['', '', '', ''])
  // Error state (syncs with prop)
  const [error, setError] = useState<string | null>(errorMessage || null)
  // Submission/loading state
  const [isSubmitting, setIsSubmitting] = useState(false)
  // Refs for each input for focus management
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  // Update error when the prop changes
  useEffect(() => {
    setError(errorMessage || null)
    if (errorMessage) {
      setIsSubmitting(false)
    }
  }, [errorMessage])

  // Focus the first input when the component mounts
  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus()
    }
  }, [])

  /**
   * Handles changes in PIN input fields, auto-advances focus, and restricts to digits.
   */
  const handlePinChange = (index: number, value: string) => {
    // Only allow numbers
    if (value && !/^\d+$/.test(value)) {
      return
    }

    // Update the PIN array
    const newPin = [...pin]
    newPin[index] = value
    setPin(newPin)

    // Move focus to the next input if this one is filled
    if (value && index < pin.length - 1) {
      const nextInput = inputRefs.current[index + 1]
      if (nextInput) {
        // Focus the next input field
        nextInput.focus()
      }
    }
  }

  /**
   * Handles keyboard events for PIN input fields (e.g., backspace for focus).
   * @param index The index of the PIN input field.
   * @param e The keyboard event.
   */
  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    // Move focus to the previous input on backspace if current input is empty
    if (e.key === 'Backspace' && !pin[index] && index > 0) {
      const prevInput = inputRefs.current[index - 1]
      if (prevInput) {
        // Focus the previous input field
        prevInput.focus()
      }
    }
  }

  /**
   * Handles verification (submission) of the PIN.
   */
  const handleVerify = () => {
    const fullPin = pin.join('')
    // Validate full PIN length
    if (fullPin.length < 4) {
      setError('Please enter a complete PIN')
      return
    }
    
    setIsSubmitting(true)
    setError(null)
    // Call parent handler
    onVerify(fullPin)
  }

  /**
   * Resets the PIN input and error state, and refocuses the first input.
   */
  const resetPin = () => {
    setPin(['', '', '', ''])
    setError(null)
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus()
    }
  }

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Enter Your PIN</h2>
        <p className="text-gray-600 mb-6">
          Enter your security PIN to {action.toLowerCase()}
        </p>
        
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{error}</p>
            <button 
              onClick={resetPin}
              className="text-xs text-red-700 underline mt-1 hover:text-red-800"
            >
              Try again with a different PIN
            </button>
          </div>
        )}
        
        <div className="flex justify-center space-x-2 mb-6">
          {pin.map((digit, index) => (
            <input
              key={index}
              ref={(el) => (inputRefs.current[index] = el)}
              type="password"
              value={digit}
              onChange={(e) => handlePinChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              maxLength={1}
              className="w-12 h-12 text-center text-xl font-semibold border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
            />
          ))}
        </div>
        
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleVerify}
            disabled={isSubmitting || pin.some(digit => !digit)}
            className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
              isSubmitting || pin.some(digit => !digit) 
                ? 'bg-primary-400 cursor-not-allowed' 
                : 'bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500'
            }`}
          >
            {isSubmitting ? 'Verifying...' : 'Verify'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default PinVerification
