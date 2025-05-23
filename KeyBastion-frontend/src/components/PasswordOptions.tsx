import React from 'react';
import { ArrowPathIcon } from '@heroicons/react/24/outline';

interface OptionCheckboxProps {
  id: string;
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

const OptionCheckbox: React.FC<OptionCheckboxProps> = ({ id, label, checked, onChange }) => (
  <div className="flex items-center">
    <input
      id={id}
      name={id}
      type="checkbox"
      checked={checked}
      onChange={e => onChange(e.target.checked)}
      className="h-5 w-5 text-primary-700 focus:ring-primary-500 border-gray-300 rounded"
    />
    <label htmlFor={id} className="ml-2 block text-sm text-gray-700">
      {label}
    </label>
  </div>
);

interface PasswordOptionsProps {
  length: number;
  setLength: (v: number) => void;
  includeLowercase: boolean;
  setIncludeLowercase: (v: boolean) => void;
  includeUppercase: boolean;
  setIncludeUppercase: (v: boolean) => void;
  includeNumbers: boolean;
  setIncludeNumbers: (v: boolean) => void;
  includeSpecial: boolean;
  setIncludeSpecial: (v: boolean) => void;
  isLoading: boolean;
  onGenerate: () => void;
}

const PasswordOptions: React.FC<PasswordOptionsProps> = ({
  length,
  setLength,
  includeLowercase,
  setIncludeLowercase,
  includeUppercase,
  setIncludeUppercase,
  includeNumbers,
  setIncludeNumbers,
  includeSpecial,
  setIncludeSpecial,
  isLoading,
  onGenerate,
}) => (
  <div className="space-y-4">
    <h3 className="text-lg font-medium leading-6 text-gray-900">Password Options</h3>
    {/* Length slider */}
    <div>
      <div className="flex items-center justify-between">
        <label htmlFor="length" className="block text-sm font-medium text-gray-700">
          Length: {length} characters
        </label>
      </div>
      <input
        type="range"
        id="length"
        name="length"
        min="8"
        max="32"
        value={length}
        onChange={e => setLength(parseInt(e.target.value))}
        className="mt-1 w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-sky-700"
      />
      <div className="flex justify-between text-xs text-gray-500">
        <span>8</span>
        <span>16</span>
        <span>24</span>
        <span>32</span>
      </div>
    </div>
    {/* Character options */}
    <div className="space-y-2">
      <OptionCheckbox
        id="lowercase"
        label="Include lowercase letters (a-z)"
        checked={includeLowercase}
        onChange={setIncludeLowercase}
      />
      <OptionCheckbox
        id="uppercase"
        label="Include uppercase letters (A-Z)"
        checked={includeUppercase}
        onChange={setIncludeUppercase}
      />
      <OptionCheckbox
        id="numbers"
        label="Include numbers (0-9)"
        checked={includeNumbers}
        onChange={setIncludeNumbers}
      />
      <OptionCheckbox
        id="special"
        label="Include special characters (!@#$%^&*)"
        checked={includeSpecial}
        onChange={setIncludeSpecial}
      />
    </div>
    {/* Generate button */}
    <div className="flex space-x-3">
      <button
        type="button"
        onClick={onGenerate}
        disabled={isLoading || (!includeLowercase && !includeUppercase && !includeNumbers && !includeSpecial)}
        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <>
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Generating...
          </>
        ) : (
          <>
            <ArrowPathIcon className="-ml-1 mr-2 h-4 w-4" />
            Generate Password
          </>
        )}
      </button>
    </div>
  </div>
);

export default PasswordOptions;
