import React from 'react';

/**
 * Component that displays a list of password security best practices.
 * 
 * This component renders a card with helpful security tips for users to follow
 * when creating and managing their passwords. It serves as an educational element
 * to promote good security habits alongside the password generation functionality.
 * 
 * The tips focus on key security principles such as password uniqueness, length,
 * complexity, and the use of password managers for secure storage.
 */
const PasswordTips: React.FC = () => (
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
);

export default PasswordTips;
