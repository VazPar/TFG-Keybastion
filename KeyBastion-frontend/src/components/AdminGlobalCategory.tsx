import { useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

/**
 * Props for AdminGlobalCategory component.
 * - onSubmit: called with category data when form is submitted and passes validation.
 * - onCancel: called when the modal is dismissed/cancelled.
 */
interface AdminGlobalCategoryProps {
  onSubmit: (categoryData: { name: string; description?: string }) => Promise<void>;
  onCancel: () => void;
}

/**
 * AdminGlobalCategory is a modal form for creating a new global category.
 * Handles form state, validation, submission, and error display for admin users.
 */
const AdminGlobalCategory = ({ onSubmit, onCancel }: AdminGlobalCategoryProps) => {
  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Handles form submission, including validation and async submission logic.
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form: category name required
    if (!name) {
      setError('Category name is required');
      return;
    }
    
    try {
      setIsSubmitting(true);
      setError(null);
      // Attempt to submit category creation (calls parent handler)
      await onSubmit({ 
        name, 
        description: description || undefined 
      });
      
      // Reset form on success
      setName('');
      setDescription('');
    } catch (err: any) {
      // Show error from backend or fallback message
      const errorMessage = err.response?.data?.error || 'Failed to create global category';
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    // Modal dialog for global category creation
    <div className="fixed inset-0 z-10 overflow-y-auto">
      <div className="flex min-h-screen items-end justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Overlay background, closes modal on click */}
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onCancel}></div>

        <span className="hidden sm:inline-block sm:h-screen sm:align-middle" aria-hidden="true">&#8203;</span>
        
        <div className="inline-block transform overflow-hidden rounded-lg bg-white text-left align-bottom shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:align-middle">
          {/* Close button */}
          <div className="absolute top-0 right-0 pt-4 pr-4">
            <button
              type="button"
              className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2"
              onClick={onCancel}
            >
              <span className="sr-only">Close</span>
              <XMarkIcon className="h-6 w-6" aria-hidden="true" />
            </button>
          </div>
          
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                <h3 className="text-lg font-medium leading-6 text-gray-900">Create Global Category</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Global categories are available to all users in the system.
                </p>
                
                <div className="mt-4">
                  <form onSubmit={handleSubmit}>
                    {error && (
                      <div className="mb-4 rounded-md bg-red-50 p-4">
                        <div className="flex">
                          <div className="flex-shrink-0">
                            <XMarkIcon className="h-5 w-5 text-red-400" aria-hidden="true" />
                          </div>
                          <div className="ml-3">
                            <h3 className="text-sm font-medium text-red-800">{error}</h3>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <div className="mb-4">
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                        Category Name
                      </label>
                      <input
                        type="text"
                        name="name"
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500 sm:text-sm"
                        required
                      />
                    </div>
                    
                    <div className="mb-4">
                      <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                        Description (Optional)
                      </label>
                      <textarea
                        name="description"
                        id="description"
                        rows={3}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500 sm:text-sm"
                      />
                    </div>
                    
                    <div className="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="inline-flex w-full justify-center rounded-md border border-transparent bg-sky-700 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-sky-800 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 sm:col-start-2 sm:text-sm"
                      >
                        {isSubmitting ? 'Creating...' : 'Create Category'}
                      </button>
                      <button
                        type="button"
                        onClick={onCancel}
                        className="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 sm:col-start-1 sm:mt-0 sm:text-sm"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminGlobalCategory;
