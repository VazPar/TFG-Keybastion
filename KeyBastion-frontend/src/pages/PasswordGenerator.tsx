import { usePasswordGenerator } from '../hooks/usePasswordGenerator';
import PasswordOptions from '../components/PasswordOptions';
import SavePasswordForm from '../components/SavePasswordForm';
import PasswordDisplay from '../components/PasswordDisplay';
import PasswordTips from '../components/PasswordTips';
import { BookmarkIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';

/**
 * PasswordGenerator component that provides a complete interface for generating and saving secure passwords.
 * 
 * This component combines multiple sub-components to create a comprehensive password management experience:
 * - Password generation with customizable options (length, character types)
 * - Password strength evaluation and visual feedback
 * - Password saving functionality with metadata (account name, URL, notes, category)
 * - Password security tips
 * 
 * @returns A React component for generating and saving secure passwords
 */
const PasswordGenerator = () => {
    const {
        password,
        passwordStrength,
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
        copied,
        isLoading,
        error,
        saveSuccess,
        isSaving,
        accountName,
        setAccountName,
        serviceUrl,
        setServiceUrl,
        notes,
        setNotes,
        categoryId,
        setCategoryId,
        categoryTypes,

        generatePassword,
        copyToClipboard,
        savePassword,
    } = usePasswordGenerator();

    /**
     * Local state to control the visibility of the password saving form
     */
    const [showSaveForm, setShowSaveForm] = useState(false);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-semibold text-gray-900">Password Generator</h1>
                <p className="mt-1 text-sm text-gray-500">
                    Create strong, secure passwords for your accounts
                </p>
            </div>

            {/* Error message display */}
            {error && (
                <div className="rounded-md bg-red-50 p-4">
                    <div className="flex">
                        <div className="ml-3">
                            <h3 className="text-sm font-medium text-red-800">{error}</h3>
                        </div>
                    </div>
                </div>
            )}

            {/* Success message display */}
            {saveSuccess && (
                <div className="rounded-md bg-green-50 p-4">
                    <div className="flex">
                        <div className="ml-3">
                            <h3 className="text-sm font-medium text-green-800">Password saved successfully!</h3>
                        </div>
                    </div>
                </div>
            )}

            <div className="bg-white shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                    <div className="space-y-6">
                        {/* Password display */}
                        <PasswordDisplay
                            password={password}
                            passwordStrength={passwordStrength}
                            copied={copied}
                            onCopy={copyToClipboard}
                        />

                        {/* Password options */}
                        <PasswordOptions
                            length={length}
                            setLength={setLength}
                            includeLowercase={includeLowercase}
                            setIncludeLowercase={setIncludeLowercase}
                            includeUppercase={includeUppercase}
                            setIncludeUppercase={setIncludeUppercase}
                            includeNumbers={includeNumbers}
                            setIncludeNumbers={setIncludeNumbers}
                            includeSpecial={includeSpecial}
                            setIncludeSpecial={setIncludeSpecial}
                            isLoading={isLoading}
                            onGenerate={generatePassword}
                        />

                        {/* Save button */}
                        <div className="flex space-x-3">

                            {/* Save password button - only shown when a password exists */}
                            {password && (
                                <button
                                    type="button"
                                    onClick={() => setShowSaveForm(!showSaveForm)}
                                    className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-700"
                                >
                                    <BookmarkIcon className="-ml-1 mr-2 h-4 w-4" />
                                    {showSaveForm ? 'Cancel' : 'Save Password'}
                                </button>
                            )}
                        </div>

                        {/* Save password form - only shown when showSaveForm is true and a password exists */}
                        {showSaveForm && password && (
                            <SavePasswordForm
                                accountName={accountName}
                                setAccountName={setAccountName}
                                serviceUrl={serviceUrl}
                                setServiceUrl={setServiceUrl}
                                notes={notes}
                                setNotes={setNotes}
                                categoryId={categoryId}
                                setCategoryId={setCategoryId}
                                categoryTypes={categoryTypes}
                                isSaving={isSaving}
                                savePassword={savePassword}
                            />
                        )}
                    </div>
                </div>
            </div>

            {/* Password tips */}
            <PasswordTips />
        </div>
    )
}

export default PasswordGenerator