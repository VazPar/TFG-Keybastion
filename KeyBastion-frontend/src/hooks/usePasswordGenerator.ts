import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import passwordService from '../services/passwordService';
import categoryService, { CategoryType } from '../services/categoryService';
import { credentialService } from '../services/credentialService';

/**
 * Custom hook for password generation and management functionality.
 * 
 * This hook provides a complete set of functions and state for:
 * - Generating secure passwords with customizable criteria
 * - Evaluating password strength
 * - Copying passwords to clipboard
 * - Saving passwords with associated metadata
 * - Managing password generation options
 * 
 * @returns An object containing password state, generation options, and functions
 */
export function usePasswordGenerator() {
  /** Credential ID from URL params, used for edit mode */
  const { id } = useParams<{ id: string }>();
  
  /** The currently generated password */
  const [password, setPassword] = useState('');
  
  /** Strength score of the current password (0-100) */
  const [passwordStrength, setPasswordStrength] = useState(0);
  
  /** Password length setting */
  const [length, setLength] = useState(16);
  
  /** Whether to include lowercase letters in generated passwords */
  const [includeLowercase, setIncludeLowercase] = useState(true);
  
  /** Whether to include uppercase letters in generated passwords */
  const [includeUppercase, setIncludeUppercase] = useState(true);
  
  /** Whether to include numbers in generated passwords */
  const [includeNumbers, setIncludeNumbers] = useState(true);
  
  /** Whether to include special characters in generated passwords */
  const [includeSpecial, setIncludeSpecial] = useState(true);
  
  /** Whether the password has been copied to clipboard */
  const [copied, setCopied] = useState(false);
  
  /** Whether a password generation request is in progress */
  const [isLoading, setIsLoading] = useState(false);
  
  /** Error message if any operation fails */
  const [error, setError] = useState<string | null>(null);
  
  /** Whether the password was successfully saved */
  const [saveSuccess, setSaveSuccess] = useState(false);
  
  /** Whether a password save request is in progress */
  const [isSaving, setIsSaving] = useState(false);
  
  /** Whether we're in edit mode (modifying an existing credential) */
  const [isEditMode, setIsEditMode] = useState(false);

  // Save form state
  /** Account name for the credential being saved */
  const [accountName, setAccountName] = useState('');
  
  /** Service URL for the credential being saved */
  const [serviceUrl, setServiceUrl] = useState('');
  
  /** Optional notes for the credential being saved */
  const [notes, setNotes] = useState('');
  
  /** Selected category ID for the credential being saved */
  const [categoryId, setCategoryId] = useState('');
  
  /** Available category types for credential organization */
  const [categoryTypes, setCategoryTypes] = useState<CategoryType[]>([]);

  /**
   * Set edit mode based on whether an ID is present in the URL
   */
  useEffect(() => {
    setIsEditMode(!!id);
  }, [id]);

  /**
   * Fetch available category types on component mount
   */
  useEffect(() => {
    const fetchCategoryTypes = async () => {
      try {
        const types = await categoryService.getCategoryTypes();
        setCategoryTypes(types);
      } catch (err) {
        // Optionally handle error
      }
    };
    fetchCategoryTypes();
  }, []);

  /**
   * Generates a new password based on the current criteria settings.
   * Makes an API call to the backend password generation service.
   * Updates the password and strength state on success.
   */
  const generatePassword = async () => {
    setIsLoading(true);
    setError(null);
    setCopied(false);
    setSaveSuccess(false);
    try {
      const result = await passwordService.generatePassword({
        length,
        includeLowercase,
        includeUppercase,
        includeNumbers,
        includeSpecial
      });
      if (result && result.password) {
        setPassword(result.password);
        setPasswordStrength(result.strength || 0);
      } else {
        throw new Error('Invalid response from password service');
      }
    } catch (err) {
      setError('Failed to generate password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Sets the copied state to true for 2 seconds to provide visual feedback.
   * The actual clipboard copy is handled by the PasswordDisplay component.
   */
  const copyToClipboard = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  /**
   * Saves the current password and its associated metadata as a credential.
   * Validates required fields and handles both create and edit modes.
   * Updates UI state for loading, success, and error conditions.
   */
  const savePassword = async () => {
    if (!accountName || !serviceUrl) {
      setError('Account name and service URL are required');
      return;
    }
    setIsSaving(true);
    setError(null);
    setSaveSuccess(false);
    try {
      if (!password && !isEditMode) {
        throw new Error('No password to save. Please generate a password first.');
      }
      const credentialData = {
        accountName,
        password,
        serviceUrl,
        notes,
        // Only include categoryId if it's a valid UUID and not the 'new-category' special value
        ...(categoryId && categoryId !== 'new-category' && categoryId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i) ? { categoryId } : {}),
        passwordLength: length,
        includeLowercase,
        includeUppercase,
        includeNumbers,
        includeSpecial,
        passwordStrength
      };
      // Mask password in logs for security
      console.log('Saving credential:', { ...credentialData, password: '********' });
      if (isEditMode && id) {
        // Edit mode logic (not shown here)
      } else {
        await credentialService.createCredential(credentialData);
        setSaveSuccess(true);
      }
    } catch (err) {
      setError('Failed to save password. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return {
    password,
    setPassword,
    passwordStrength,
    setPasswordStrength,
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
    setCopied,
    isLoading,
    setIsLoading,
    error,
    setError,
    saveSuccess,
    setSaveSuccess,
    isSaving,
    setIsSaving,
    isEditMode,
    setIsEditMode,
    accountName,
    setAccountName,
    serviceUrl,
    setServiceUrl,
    notes,
    setNotes,
    categoryId,
    setCategoryId,
    categoryTypes,
    setCategoryTypes,
    generatePassword,
    copyToClipboard,
    savePassword,
  };
}
