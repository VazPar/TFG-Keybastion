import React from 'react';
import { ClipboardDocumentIcon, CheckIcon } from '@heroicons/react/24/outline';
import PasswordStrengthIndicator from './PasswordStrengthIndicator';

/**
 * Props for the PasswordDisplay component
 */
interface PasswordDisplayProps {
  /** The password to display */
  password: string;
  /** Strength score of the password (0-100) */
  passwordStrength: number;
  /** Whether the password has been copied to clipboard */
  copied: boolean;
  /** Function to call when the copy button is clicked */
  onCopy: () => void;
}

/**
 * Component for displaying a generated password with copy functionality and strength indicator.
 * 
 * This component shows the generated password in a read-only input field with a copy button.
 * It also displays a visual indicator of the password's strength when a password is present.
 * 
 * @param props - Component props
 * @returns A React component for displaying and copying a password
 */
const PasswordDisplay: React.FC<PasswordDisplayProps> = ({ password, passwordStrength, copied, onCopy }) => (
  <div>
    <label htmlFor="password" className="block text-sm font-medium text-gray-700">
      Generated Password
    </label>
    <div className="mt-1 relative rounded-md shadow-sm">
      <input
        type="text"
        id="password"
        className="block w-full pr-10 focus:outline-none focus:ring-sky-700 focus:border-sky-700 text-lg border-gray-300 rounded-md h-12 py-2"
        value={password}
        readOnly
        placeholder="Click generate to create a password"
      />
      <div className="absolute inset-y-0 right-0 flex items-center pr-3">
        <button
          onClick={onCopy}
          disabled={!password}
          className="text-gray-400 hover:text-gray-500 focus:outline-none disabled:opacity-50"
          title="Copy to clipboard"
        >
          {copied ? (
            <>
              <CheckIcon className="-ml-0.5 mr-2 h-4 w-4" aria-hidden="true" />
              Copied!
            </>
          ) : (
            <>
              <ClipboardDocumentIcon className="-ml-0.5 mr-2 h-4 w-4" aria-hidden="true" />
              Copy
            </>
          )}
        </button>
      </div>
    </div>
    {copied && (
      <p className="mt-2 text-sm text-green-600">Copied to clipboard!</p>
    )}
    {password && <PasswordStrengthIndicator strength={passwordStrength} />}
  </div>
);

export default PasswordDisplay;
