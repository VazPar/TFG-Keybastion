import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { EyeIcon, EyeSlashIcon, PlusIcon } from '@heroicons/react/24/outline'
import { categoryService, Category, CategoryType } from '../services/categoryService'
import { credentialService } from '../services/credentialService'
import api from '../services/api'

const PasswordStrengthIndicator = ({ strength }: { strength: number }) => {
  let bgColor = 'bg-red-500'
  let label = 'Weak'

  if (strength >= 80) {
    bgColor = 'bg-green-500'
    label = 'Very Strong'
  } else if (strength >= 60) {
    bgColor = 'bg-blue-500'
    label = 'Strong'
  } else if (strength >= 40) {
    bgColor = 'bg-yellow-500'
    label = 'Medium'
  }

  return (
    <div className="mt-4">
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm font-medium text-gray-700">Password Strength: {label}</span>
        <span className="text-sm font-medium text-gray-700">{strength}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div className={`${bgColor} h-2.5 rounded-full`} style={{ width: `${strength}%` }}></div>
      </div>
    </div>
  )
}

interface CategoryByType {
  type: string;
  categories: Category[];
}

const AddExistingPassword = () => {
  const navigate = useNavigate()

  // Password state
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [saveSuccess, setSaveSuccess] = useState(false)

  // Credential saving
  const [accountName, setAccountName] = useState('')
  const [serviceUrl, setServiceUrl] = useState('')
  const [notes, setNotes] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [categoriesByType, setCategoriesByType] = useState<CategoryByType[]>([])

  // New category creation
  const [showNewCategoryForm, setShowNewCategoryForm] = useState(false)
  const [newCategoryType, setNewCategoryType] = useState('')
  const [newCategoryName, setNewCategoryName] = useState('')
  const [newCategoryDescription, setNewCategoryDescription] = useState('')
  const [isCreatingCategory, setIsCreatingCategory] = useState(false)

  // State for category types
  const [categoryTypes, setCategoryTypes] = useState<CategoryType[]>([])

  // UI state
  const [isSaving, setIsSaving] = useState(false)

  // Fetch category types and categories on component mount
  useEffect(() => {
    const fetchCategoryData = async () => {
      try {
        // Fetch all categories
        const allCategories = await categoryService.getCategories()
        console.log('Fetched categories:', allCategories)
        
        // Fetch category types
        const categoryTypes = await categoryService.getCategoryTypes()
        console.log('Fetched category types:', categoryTypes)
        setCategoryTypes(categoryTypes)
        
        // Group categories by type
        const groupedCategories: CategoryByType[] = []
        
        // If no categories exist yet, create empty groups for each category type
        if (allCategories.length === 0) {
          categoryTypes.forEach(type => {
            groupedCategories.push({
              type: type.label,
              categories: []
            })
          })
        } else {
          // Group existing categories by type
          allCategories.forEach(category => {
            if (category.categoryType) {
              const existingGroup = groupedCategories.find(group => group.type === category.categoryType)
              if (existingGroup) {
                existingGroup.categories.push(category)
              } else {
                groupedCategories.push({
                  type: category.categoryType,
                  categories: [category]
                })
              }
            }
          })
        }
        
        console.log('Grouped categories:', groupedCategories)
        setCategoriesByType(groupedCategories)
      } catch (err) {
        console.error('Error fetching category data:', err)
      }
    }

    fetchCategoryData()
  }, [])

  // Evaluate password strength whenever password changes
  useEffect(() => {
    if (password) {
      evaluatePasswordStrength(password)
    } else {
      setPasswordStrength(0)
    }
  }, [password])

  // Simple password strength evaluation
  const evaluatePasswordStrength = async (pwd: string) => {
    try {
      // Use the correct API endpoint with proper typing
      const response = await api.post<number>('/api/passwords/evaluate', { password: pwd });
      if (typeof response === 'number') {
        setPasswordStrength(response);
      } else {
        console.error('Unexpected response type:', response);
        evaluatePasswordLocally(pwd);
      }
    } catch (err) {
      console.error('Error evaluating password strength:', err);
      // Fallback to local evaluation
      evaluatePasswordLocally(pwd);
    }
  }

  // Local password strength evaluation as fallback
  const evaluatePasswordLocally = (pwd: string) => {
    let score = 0;
    
    // Length check
    if (pwd.length >= 12) {
      score += 25;
    } else if (pwd.length >= 8) {
      score += 15;
    } else if (pwd.length >= 6) {
      score += 10;
    }

    // Character variety checks
    if (/[a-z]/.test(pwd)) score += 15;
    if (/[A-Z]/.test(pwd)) score += 15;
    if (/[0-9]/.test(pwd)) score += 15;
    if (/[^A-Za-z0-9]/.test(pwd)) score += 20;

    // Penalize repeating characters
    const repeats = pwd.match(/(.)\1{2,}/g);
    if (repeats) {
      score -= repeats.length * 5;
    }

    // Ensure score is between 0-100
    score = Math.max(0, Math.min(100, score));
    
    setPasswordStrength(score);
  }

  const createNewCategory = async () => {
    if (!newCategoryType || !newCategoryName) {
      return
    }

    try {
      setIsCreatingCategory(true)
      const newCategory = await categoryService.createCategory({
        name: newCategoryName,
        description: newCategoryDescription,
        categoryType: newCategoryType
      })

      // Update the categoriesByType list
      setCategoriesByType(prev => {
        const typeExists = prev.find(t => t.type === newCategoryType)
        if (typeExists) {
          return prev.map(t => 
            t.type === newCategoryType 
              ? { ...t, categories: [...t.categories, newCategory] } 
              : t
          )
        } else {
          return [...prev, { 
            type: newCategoryType, 
            categories: [newCategory] 
          }]
        }
      })
      
      setCategoryId(newCategory.id)
      setShowNewCategoryForm(false)
      setNewCategoryType('')
      setNewCategoryName('')
      setNewCategoryDescription('')
    } catch (err) {
      console.error('Error creating category:', err)
      setError('Failed to create category. Please try again.')
    } finally {
      setIsCreatingCategory(false)
    }
  }

  const savePassword = async () => {
    if (!accountName || !serviceUrl || !password) {
      setError('Please fill in all required fields.')
      return
    }

    try {
      setIsSaving(true)
      setError(null)

      // Determine character types in the password
      const includeLowercase = /[a-z]/.test(password)
      const includeUppercase = /[A-Z]/.test(password)
      const includeNumbers = /[0-9]/.test(password)
      const includeSpecial = /[^A-Za-z0-9]/.test(password)

      await credentialService.createCredential({
        accountName,
        password,
        serviceUrl,
        notes,
        passwordLength: password.length,
        includeLowercase,
        includeUppercase,
        includeNumbers,
        includeSpecial,
        passwordStrength,
        categoryId: categoryId || undefined
      })

      setSaveSuccess(true)
      
      // Reset form
      setPassword('')
      setAccountName('')
      setServiceUrl('')
      setNotes('')
      setCategoryId('')
      
      // Redirect to passwords page after successful save
      setTimeout(() => {
        navigate('/passwords')
      }, 1500)
    } catch (err: any) {
      console.error('Error saving password:', err)
      
      if (err.response) {
        // Handle different HTTP error statuses
        if (err.response.status === 401) {
          setError('You must be logged in to save passwords.')
        } else if (err.response.status === 400) {
          setError('Invalid data. Please check your inputs and try again.')
        } else {
          setError('Failed to save password. Please try again.')
        }
      } else if (err.request) {
        setError('Network error. Please check your connection and try again.')
      } else {
        setError('An unexpected error occurred. Please try again.')
      }
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Add Existing Password</h1>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-4 py-5 sm:p-6">
          {error && (
            <div className="rounded-md bg-red-50 p-4 mb-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">{error}</h3>
                </div>
              </div>
            </div>
          )}

          {saveSuccess && (
            <div className="rounded-md bg-green-50 p-4 mb-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-green-800">Password saved successfully!</h3>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-6">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password <span className="text-red-500">*</span>
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pr-10 border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  placeholder="Enter your existing password"
                  required
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
              <PasswordStrengthIndicator strength={passwordStrength} />
            </div>

            <div>
              <label htmlFor="accountName" className="block text-sm font-medium text-gray-700">
                Account Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="accountName"
                value={accountName}
                onChange={(e) => setAccountName(e.target.value)}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                placeholder="e.g. Gmail, Facebook, Bank Account"
                required
              />
            </div>

            <div>
              <label htmlFor="serviceUrl" className="block text-sm font-medium text-gray-700">
                Service URL <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="serviceUrl"
                value={serviceUrl}
                onChange={(e) => setServiceUrl(e.target.value)}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                placeholder="e.g. https://gmail.com"
                required
              />
            </div>

            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                Category
              </label>
              <div className="mt-1 flex rounded-md shadow-sm">
                <select
                  id="category"
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="flex-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                >
                  <option value="">-- Select a category --</option>
                  {categoriesByType.length > 0 ? (
                    categoriesByType.map((group) => (
                      <optgroup key={group.type} label={group.type}>
                        {group.categories.map((category) => (
                          <option key={category.id} value={category.id}>
                            {category.name}
                          </option>
                        ))}
                      </optgroup>
                    ))
                  ) : (
                    <option disabled>No categories available</option>
                  )}
                </select>
                <button
                  type="button"
                  onClick={() => setShowNewCategoryForm(!showNewCategoryForm)}
                  className="ml-3 inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  <PlusIcon className="-ml-0.5 mr-2 h-4 w-4" aria-hidden="true" />
                  New
                </button>
              </div>
            </div>

            {showNewCategoryForm && (
              <div className="bg-gray-50 p-4 rounded-md">
                <h4 className="text-sm font-medium text-gray-900 mb-3">Create New Category</h4>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="newCategoryType" className="block text-sm font-medium text-gray-700">
                      Category Type <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="newCategoryType"
                      value={newCategoryType}
                      onChange={(e) => setNewCategoryType(e.target.value)}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    >
                      <option value="">-- Select a category type --</option>
                      {categoryTypes.map((type) => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="newCategoryName" className="block text-sm font-medium text-gray-700">
                      Category Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="newCategoryName"
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                      placeholder="e.g. Facebook, Twitter, Instagram"
                    />
                  </div>
                  <div>
                    <label htmlFor="newCategoryDescription" className="block text-sm font-medium text-gray-700">
                      Category Description
                    </label>
                    <textarea
                      id="newCategoryDescription"
                      value={newCategoryDescription}
                      onChange={(e) => setNewCategoryDescription(e.target.value)}
                      rows={3}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                      placeholder="Add a brief description of the category"
                    />
                  </div>
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={createNewCategory}
                      disabled={isCreatingCategory || !newCategoryType || !newCategoryName}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isCreatingCategory ? 'Creating...' : 'Create Category'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
                Notes
              </label>
              <textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                placeholder="Add any additional notes about this password"
              />
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={savePassword}
                disabled={isSaving || !accountName || !serviceUrl || !password}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? 'Saving...' : 'Save Password'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Password tips */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium leading-6 text-gray-900">Password Security Tips</h3>
          <div className="mt-4 text-sm text-gray-500">
            <ul className="list-disc pl-5 space-y-2">
              <li>Use a unique password for each account</li>
              <li>Longer passwords (16+ characters) are generally more secure</li>
              <li>Include a mix of character types for stronger security</li>
              <li>Avoid using personal information in your passwords</li>
              <li>Consider using a password manager to store your credentials securely</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AddExistingPassword
