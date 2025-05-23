import api from './api';

/**
 * Interface representing the request parameters for password generation.
 * 
 * This interface defines the customization options that can be specified
 * when generating a new password, allowing fine-grained control over
 * the password's characteristics.
 */
export interface PasswordGenerationRequest {
  /** The desired length of the password */
  length: number;
  /** Whether to include lowercase letters (a-z) */
  includeLowercase: boolean;
  /** Whether to include uppercase letters (A-Z) */
  includeUppercase: boolean;
  /** Whether to include numeric digits (0-9) */
  includeNumbers: boolean;
  /** Whether to include special characters (!@#$%^&* etc.) */
  includeSpecial: boolean;
}

/**
 * Interface representing the response from a password generation request.
 * 
 * This interface includes both the generated password and its evaluated strength,
 * allowing applications to display appropriate feedback to users about their
 * new password's security level.
 */
export interface PasswordGenerationResponse {
  /** The generated password string */
  password: string;
  /** The password strength score (0-100, where 100 is strongest) */
  strength: number;
}

/**
 * Service for password generation and management in the KeyBastion application.
 * 
 * This service provides a clean interface for interacting with the password-related
 * backend APIs, handling the communication details and providing appropriate error
 * handling and data validation.
 */
class PasswordService {
  /**
   * Generates a secure password based on the provided criteria.
   * 
   * This method calls the backend API to generate a cryptographically secure
   * random password that meets the specified requirements. The generated password
   * is automatically evaluated for strength before being returned.
   * 
   * The method includes robust error handling and validation to ensure that even
   * if the API call fails, a valid (though empty) response is returned rather than
   * throwing an exception.
   * 
   * @param options - Customization options for password generation including length and character types
   * @returns Promise resolving to an object containing the generated password and its strength score
   */
  async generatePassword(options: PasswordGenerationRequest): Promise<PasswordGenerationResponse> {
    try {
      console.log('Calling password generation endpoint with options:', options);
      
      // The api.post method already extracts response.data for us
      const result = await api.post<PasswordGenerationResponse>('/api/passwords/generate', options);
      
      console.log('Password generation result:', result);
      
      // Return the result or a default if it's not valid
      if (result && typeof result === 'object') {
        // Ensure we have a valid strength value (number between 0-100)
        let strength = 0;
        
        if ('strength' in result && typeof result.strength === 'number') {
          strength = Math.max(0, Math.min(100, result.strength));
        } else if ('strength' in result && typeof result.strength === 'string') {
          // Try to parse string to number if needed
          const parsedStrength = parseInt(result.strength as string, 10);
          if (!isNaN(parsedStrength)) {
            strength = Math.max(0, Math.min(100, parsedStrength));
          }
        }
        
        return {
          password: 'password' in result && typeof result.password === 'string' ? result.password : '',
          strength: strength
        };
      }
      
      // Fallback if the response doesn't match expected format
      return {
        password: '',
        strength: 0
      };
    } catch (error) {
      console.error('Error generating password:', error);
      // Return a default response in case of error
      return {
        password: '',
        strength: 0
      };
    }
  }
}

export const passwordService = new PasswordService();
export default passwordService;
