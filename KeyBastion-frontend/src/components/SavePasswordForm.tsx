import React from 'react';

import type { CategoryType } from '../services/categoryService';

/**
 * Interface defining the props for the SavePasswordForm component.
 * 
 * This interface specifies all the properties and callbacks required to
 * create and manage a form for saving password credentials.
 */
interface SavePasswordFormProps {
  accountName: string;
  setAccountName: (v: string) => void;
  serviceUrl: string;
  setServiceUrl: (v: string) => void;
  notes: string;
  setNotes: (v: string) => void;
  categoryId: string;
  setCategoryId: (v: string) => void;
  categoryTypes: CategoryType[];
  isSaving: boolean;
  savePassword: () => void;
}

/**
 * Component that renders a form for saving password credentials.
 * 
 * This form collects additional metadata about a password such as the account name,
 * service URL, category, and optional notes. It provides validation to ensure
 * required fields are completed before allowing submission.
 * 
 * The component is designed to be used in conjunction with the password generator
 * functionality, allowing users to save their generated passwords with relevant
 * contextual information for future reference.
 *
 * @param props - The component props
 */
const SavePasswordForm: React.FC<SavePasswordFormProps> = ({
  accountName,
  setAccountName,
  serviceUrl,
  setServiceUrl,
  notes,
  setNotes,
  categoryId,
  setCategoryId,
  categoryTypes,
  isSaving,
  savePassword,
}) => (
  <div className="mt-4 border-t pt-4">
    <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">Save Password</h3>
    <div className="space-y-4">
      <div>
        <label htmlFor="accountName" className="block text-sm font-medium text-gray-700">
          Account Name *
        </label>
        <input
          type="text"
          id="accountName"
          value={accountName}
          onChange={e => setAccountName(e.target.value)}
          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm h-10 px-3"
          placeholder="e.g. Gmail, Facebook, Twitter"
          required
        />
      </div>
      <div>
        <label htmlFor="serviceUrl" className="block text-sm font-medium text-gray-700">
          Service URL *
        </label>
        <input
          type="text"
          id="serviceUrl"
          value={serviceUrl}
          onChange={e => setServiceUrl(e.target.value)}
          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm h-10 px-3"
          placeholder="e.g. https://gmail.com"
          required
        />
      </div>
      <div>
        <label htmlFor="category" className="block text-sm font-medium text-gray-700">
          Category (optional)
        </label>
        <select
          id="category"
          name="category"
          value={categoryId}
          onChange={e => setCategoryId(e.target.value)}
          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm h-10 px-3"
        >
          <option value="">Select a category</option>
          {categoryTypes.map(category => (
            <option key={category.value} value={category.value}>{category.label}</option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
          Notes
        </label>
        <textarea
          id="notes"
          value={notes}
          onChange={e => setNotes(e.target.value)}
          rows={3}
          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm px-3"
          placeholder="Add any additional notes about this password"
        />
      </div>
      <div className="flex justify-end">
        <button
          type="button"
          onClick={savePassword}
          disabled={isSaving || !accountName || !serviceUrl}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-sky-700 hover:bg-sky-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSaving ? 'Saving...' : 'Save Password'}
        </button>
      </div>
    </div>
  </div>
);

export default SavePasswordForm;
