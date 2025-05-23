package com.jvp.KeyBastion_backend.services;

/**
 * Service interface for password generation and evaluation operations.
 */
public interface PasswordService {
    
    /**
     * Generates a password based on specified criteria.
     * 
     * @param length The length of the password
     * @param includeLowercase Whether to include lowercase letters
     * @param includeUppercase Whether to include uppercase letters
     * @param includeNumbers Whether to include numbers
     * @param includeSpecial Whether to include special characters
     * @return A randomly generated password
     */
    String generatePassword(int length, boolean includeLowercase, boolean includeUppercase,
                           boolean includeNumbers, boolean includeSpecial);
    
    /**
     * Generates a strong password with default settings.
     * 
     * @return A randomly generated strong password
     */
    String generateStrongPassword();
    
    /**
     * Evaluates the strength of a password.
     * 
     * @param password The password to evaluate
     * @return A score from 0 (very weak) to 100 (very strong)
     */
    int evaluatePasswordStrength(String password);
}
