import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline'
import { categoryService, Category } from '../services/categoryService'
import { credentialService, Credential, SaveCredentialRequest } from '../services/credentialService'

const PasswordStrengthIndicator = ({ strength }: { strength: number }) => {
  let bgColor = 'bg-red-500'
  let label = 'Weak'

  if (strength >= 80) {
    bgColor = 'bg-green-500'
    label = 'Strong'
  } else if (strength >= 50) {
    bgColor = 'bg-yellow-500'
    label = 'Medium'
  }

  return (
    <div className="mt-1">
      <div className="flex items-center">
        <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
          <div 
            className={`h-full ${bgColor}`} 
            style={{ width: `${strength}%` }}
          ></div>
        </div>
        <span className="ml-2 text-sm text-gray-500">{strength}%</span>
      </div>
      <p className="mt-1 text-sm text-gray-500">Password strength: {label}</p>
    </div>
  )
}

interface CategoryByType {
  type: string
  categories: Category[]
}

const EditPassword = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  // Form state
  const [credential, setCredential] = useState<Credential | null>(null)
  const [accountName, setAccountName] = useState('')
  const [serviceUrl, setServiceUrl] = useState('')
  const [notes, setNotes] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [categoriesByType, setCategoriesByType] = useState<CategoryByType[]>([])
  const [passwordStrength, setPasswordStrength] = useState(0)
  const [showPassword, setShowPassword] = useState(false)
  const [password, setPassword] = useState('')

  // UI state
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saveSuccess, setSaveSuccess] = useState(false)

  // Fetch credential and categories on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        
        // Fetch credential by ID
        if (id) {
          const credentialData = await credentialService.getCredentialById(id)
          console.log('Fetched credential data:', {
            ...credentialData,
            encryptedPassword: '[PROTECTED]'
          })
          
          setCredential(credentialData)
          setAccountName(credentialData.accountName || '')
          setServiceUrl(credentialData.serviceUrl || '')
          setNotes(credentialData.notes || '')
          setCategoryId(credentialData.categoryId || '')
          setPasswordStrength(credentialData.passwordStrength || 0)
          
          // Don't set password - it will be entered by user if they want to change it
          setPassword('')
        }
        
        // Fetch categories
        const allCategories = await categoryService.getCategories()
        const categoryTypes = await categoryService.getCategoryTypes()
        
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
        
        setCategoriesByType(groupedCategories)
      } catch (err) {
        console.error('Error fetching data:', err)
        setError('Failed to load password data. Please try again.')
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [id])

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!accountName || !serviceUrl) {
      setError('Account name and service URL are required')
      return
    }
    
    try {
      setIsSaving(true)
      setError(null)
      
      const updateData: SaveCredentialRequest = {
        accountName,
        serviceUrl,
        notes: notes || undefined,
        categoryId: categoryId || undefined,
        // Only include password if it was changed (not empty)
        password: password || '', 
        // Preserve existing password generation parameters
        passwordLength: credential?.passwordLength || 12,
        includeLowercase: credential?.includeLowercase || true,
        includeUppercase: credential?.includeUppercase || true,
        includeNumbers: credential?.includeNumbers || true,
        includeSpecial: credential?.includeSpecial || false,
        passwordStrength: credential?.passwordStrength || passwordStrength
      }
      
      console.log('Updating credential with data:', {
        ...updateData,
        password: updateData.password ? '[REDACTED]' : '[UNCHANGED]'
      })
      
      if (id) {
        await credentialService.updateCredential(id, updateData)
        setSaveSuccess(true)
        
        // Reset form after success
        setTimeout(() => {
          navigate('/passwords')
        }, 1500)
      }
    } catch (err: any) {
      console.error('Error updating password:', err)
      if (err.response) {
        if (err.response.status === 401) {
          setError('Your session has expired. Please log in again.')
        } else if (err.response.status === 400) {
          setError('Invalid data. Please check your inputs and try again.')
        } else {
          setError('Failed to update password. Please try again.')
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Edit Password</h1>
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
                  <h3 className="text-sm font-medium text-green-800">Password updated successfully!</h3>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
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
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                New Password (leave blank to keep current password)
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pr-10 border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  placeholder="Enter a new password or leave blank to keep current"
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
              {password && <PasswordStrengthIndicator strength={passwordStrength} />}
            </div>

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
                placeholder="Add any notes about this password"
              />
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => navigate('/passwords')}
                className="mr-3 inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default EditPassword
