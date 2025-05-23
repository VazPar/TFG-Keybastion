import api from './api';
import type { Category } from '../types';

export interface Owner {
  id: string;
  username: string;
}

export interface Credential {
  id: string;
  accountName: string;
  encryptedPassword: string;
  serviceUrl: string;
  notes?: string;
  createdAt: string;
  passwordStrength: number;
  passwordLength: number;
  includeLowercase: boolean;
  includeUppercase: boolean;
  includeNumbers: boolean;
  includeSpecial: boolean;
  categoryId?: string;
  category?: Category;
  owner?: Owner;
  isOwner?: boolean;
  sharedBy?: Owner;
  sharingId?: string;
}

export interface CredentialsResponse {
  ownCredentials: Credential[];
  sharedCredentials: Credential[];
}

export interface SaveCredentialRequest {
  accountName: string;
  password: string;
  serviceUrl: string;
  notes?: string;
  passwordLength: number;
  includeLowercase: boolean;
  includeUppercase: boolean;
  includeNumbers: boolean;
  includeSpecial: boolean;
  passwordStrength: number;
  categoryId?: string;
}

export interface DashboardStats {
  totalPasswords: number;
  strongPasswords: number;
  recentlyAdded: number;
  needsAttention: number;
}

/**
 * CredentialService provides all API interactions related to credential (password) management.
 * 
 * This service is the central point for all credential-related operations in the KeyBastion
 * application, including CRUD operations, PIN verification, and security-related functions.
 * It handles both regular and shared credentials with appropriate security measures.
 */
class CredentialService {
  /**
   * Retrieves all credentials for the authenticated user.
   * 
   * The response includes both credentials owned by the user and credentials
   * shared with the user by others, each in separate collections.
   * 
   * @returns Promise resolving to an object with ownCredentials and sharedCredentials arrays
   */
  public async getCredentials(): Promise<CredentialsResponse> {
    return api.get('/api/credentials');
  }

  /**
   * Retrieves a specific credential by its unique identifier.
   * 
   * This method fetches detailed information about a single credential,
   * including all its properties and metadata.
   * 
   * @param id - The unique identifier of the credential to retrieve
   * @returns Promise resolving to the complete credential object
   */
  public async getCredentialById(id: string): Promise<Credential> {
    return api.get(`/api/credentials/${id}`);
  }

  /**
   * Creates a new credential with the provided information.
   * 
   * This method securely stores a new password entry in the system. The password
   * will be encrypted on the server side before storage.
   * 
   * @param credential - The credential data to save, including the plaintext password
   * @returns Promise resolving to the newly created credential (with encrypted password)
   */
  public async createCredential(credential: SaveCredentialRequest): Promise<Credential> {
    return api.post('/api/credentials', credential);
  }

  /**
   * Updates an existing credential with new information.
   * 
   * This method allows modification of credential properties including the password itself.
   * If the password is changed, the new password will be encrypted on the server side.
   * 
   * @param id - The unique identifier of the credential to update
   * @param credential - The updated credential data
   * @returns Promise resolving to the updated credential object
   */
  public async updateCredential(id: string, credential: SaveCredentialRequest): Promise<Credential> {
    return api.put(`/api/credentials/${id}`, credential);
  }

  /**
   * Deletes a credential by its ID with special handling for shared credentials.
   * 
   * This method implements the client-side of the shared credential deletion flow:
   * 1. If deleting a regular credential, no confirmation is needed
   * 2. If deleting a shared credential, the confirm parameter must be set to true
   *    to acknowledge that all shares will be removed
   * 
   * When confirm=false (or not provided) for a shared credential, the backend will
   * return a 409 Conflict status with a warning message and requiresConfirmation flag.
   * The UI should then display this warning and call this method again with confirm=true
   * if the user agrees to proceed.
   * 
   * @param id - The unique identifier of the credential to delete
   * @param confirm - Optional boolean flag to confirm deletion of a shared credential
   * @returns Promise that resolves when deletion is successful
   */
  public async deleteCredential(id: string, confirm?: boolean): Promise<void> {
    const url = confirm ? `/api/credentials/${id}?confirm=true` : `/api/credentials/${id}`;
    return api.delete(url);
  }

  /**
   * Retrieves statistical information about the user's credentials for the dashboard.
   * 
   * This method provides summary metrics about the user's password collection, including:
   * - Total number of passwords stored
   * - Number of strong passwords (high strength score)
   * - Number of recently added passwords
   * - Number of passwords that need attention (weak or outdated)
   * 
   * @returns Promise resolving to an object containing dashboard statistics
   */
  public async getDashboardStats(): Promise<DashboardStats> {
    return api.get('/api/credential-stats/dashboard');
  }
  
  /**
   * Verifies a user's security PIN and retrieves the decrypted password for a credential.
   * 
   * This is a security-critical method that requires the user to verify their identity
   * with a secondary PIN before accessing sensitive credential data. The method can return
   * several different responses based on the verification result:
   * 
   * - Success: Returns the decrypted password
   * - 401 Unauthorized: PIN is incorrect
   * - 403 Forbidden: User has not set a PIN yet (includes needsPin flag)
   * - 404 Not Found: Credential not found or not owned by user
   * 
   * The application should handle these responses appropriately, particularly transitioning
   * to PIN setup when needsPin flag is true.
   * 
   * @param id - UUID of the credential whose password is being requested
   * @param pin - User's security PIN for verification
   * @returns Promise resolving to an object containing the decrypted password
   */
  public async verifyPinAndGetPassword(id: string, pin: string): Promise<{ password: string }> {
    return api.post(`/api/credential-security/credentials/${id}/verify-pin`, { pin });
  }
  
  /**
   * Sets or updates a user's security PIN for accessing sensitive credential information.
   * 
   * The security PIN is a critical security feature that provides an additional layer
   * of protection beyond the user's login credentials. This PIN is required whenever
   * a user attempts to view a decrypted password.
   * 
   * The PIN should be a 4-6 digit numeric code. The backend validates this requirement.
   * 
   * @param pin - The new security PIN to set
   * @returns Promise resolving to an object with a success message
   */
  public async setSecurityPin(pin: string): Promise<{ message: string }> {
    return api.post('/api/credential-security/set-pin', { pin });
  }
}

export const credentialService = new CredentialService();
