package com.jvp.KeyBastion_backend.util;

import java.security.SecureRandom;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

/**
 * Utility class for generating secure random passwords based on configurable criteria.
 * 
 * This class provides functionality for:
 * - Generating cryptographically strong random passwords with customizable options
 * - Ensuring generated passwords include at least one character from each selected type
 * - Evaluating password strength based on length and character variety
 * 
 * The implementation uses SecureRandom for cryptographically strong randomness
 * and includes measures to avoid predictable patterns in generated passwords.
 */
public class PasswordGenerator {
    
    /** Pool of lowercase alphabetic characters */
    private static final String LOWERCASE_CHARS = "abcdefghijklmnopqrstuvwxyz";
    
    /** Pool of uppercase alphabetic characters */
    private static final String UPPERCASE_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    
    /** Pool of numeric characters */
    private static final String NUMERIC_CHARS = "0123456789";
    
    /** Pool of special characters */
    private static final String SPECIAL_CHARS = "!@#$%^&*()_-+=<>?/[]{}|";
    
    /** Cryptographically secure random number generator */
    private final SecureRandom random = new SecureRandom();
    
    /**
     * Generates a random password based on the specified parameters.
     * 
     * This method creates a password with the following guarantees:
     * - Contains at least one character from each selected character type
     * - Has the exact specified length
     * - Uses cryptographically secure randomness
     * - Shuffles characters to avoid predictable patterns
     * 
     * @param length The length of the password (must be at least 4)
     * @param includeLowercase Whether to include lowercase letters (a-z)
     * @param includeUppercase Whether to include uppercase letters (A-Z)
     * @param includeNumbers Whether to include numeric digits (0-9)
     * @param includeSpecial Whether to include special characters (!@#$%^&*()_-+=<>?/[]{}|)
     * @return A randomly generated password meeting the specified criteria
     * @throws IllegalArgumentException if all character types are excluded or length is less than 4
     *         or if length is insufficient to include all required character types
     */
    public String generatePassword(int length, boolean includeLowercase, boolean includeUppercase,
                                  boolean includeNumbers, boolean includeSpecial) {
        
        if (length < 4) {
            throw new IllegalArgumentException("Password length must be at least 4 characters");
        }
        
        if (!includeLowercase && !includeUppercase && !includeNumbers && !includeSpecial) {
            throw new IllegalArgumentException("At least one character type must be included");
        }
        
        StringBuilder charPool = new StringBuilder();
        List<Character> mandatoryChars = new ArrayList<>();
        
        if (includeLowercase) {
            charPool.append(LOWERCASE_CHARS);
            mandatoryChars.add(LOWERCASE_CHARS.charAt(random.nextInt(LOWERCASE_CHARS.length())));
        }
        
        if (includeUppercase) {
            charPool.append(UPPERCASE_CHARS);
            mandatoryChars.add(UPPERCASE_CHARS.charAt(random.nextInt(UPPERCASE_CHARS.length())));
        }
        
        if (includeNumbers) {
            charPool.append(NUMERIC_CHARS);
            mandatoryChars.add(NUMERIC_CHARS.charAt(random.nextInt(NUMERIC_CHARS.length())));
        }
        
        if (includeSpecial) {
            charPool.append(SPECIAL_CHARS);
            mandatoryChars.add(SPECIAL_CHARS.charAt(random.nextInt(SPECIAL_CHARS.length())));
        }
        
        // Ensure the password contains at least one character from each selected type
        if (mandatoryChars.size() > length) {
            throw new IllegalArgumentException("Password length must be at least " + mandatoryChars.size() + 
                                              " to include all required character types");
        }
        
        char[] password = new char[length];
        
        // First, add one character from each required type
        for (int i = 0; i < mandatoryChars.size(); i++) {
            password[i] = mandatoryChars.get(i);
        }
        
        // Fill the rest with random characters from the pool
        for (int i = mandatoryChars.size(); i < length; i++) {
            password[i] = charPool.charAt(random.nextInt(charPool.length()));
        }
        
        // Shuffle the password to avoid predictable patterns
        List<Character> passwordChars = new ArrayList<>();
        for (char c : password) {
            passwordChars.add(c);
        }
        Collections.shuffle(passwordChars, random);
        
        StringBuilder result = new StringBuilder(length);
        for (char c : passwordChars) {
            result.append(c);
        }
        
        return result.toString();
    }
    
    /**
     * Generates a strong random password with default settings.
     * 
     * This is a convenience method that creates a password with the following characteristics:
     * - 12 characters long (balancing security and usability)
     * - Includes lowercase letters, uppercase letters, numbers, and special characters
     * - Contains at least one character from each type
     * - Uses cryptographically secure randomness
     * 
     * @return A randomly generated strong password
     */
    public String generateStrongPassword() {
        return generatePassword(12, true, true, true, true);
    }
    
    /**
     * Evaluates the strength of a password on a scale of 0-100.
     * 
     * The evaluation algorithm considers two primary factors:
     * 1. Password length (up to 40 points) - 4 points per character, max 40 points
     * 2. Character variety (up to 60 points) - 15 points per character type used
     *    - Lowercase letters (a-z)
     *    - Uppercase letters (A-Z)
     *    - Numbers (0-9)
     *    - Special characters (!@#$%^&* etc.)
     * 
     * @param password The password to evaluate
     * @return A score from 0 (very weak) to 100 (very strong)
     */
    public int evaluatePasswordStrength(String password) {
        if (password == null || password.isEmpty()) {
            return 0;
        }
        
        int score = 0;
        
        // Length contribution (up to 40 points)
        score += Math.min(40, password.length() * 4);
        
        // Character variety contribution (up to 60 points)
        boolean hasLower = false;
        boolean hasUpper = false;
        boolean hasDigit = false;
        boolean hasSpecial = false;
        
        for (char c : password.toCharArray()) {
            if (Character.isLowerCase(c)) hasLower = true;
            else if (Character.isUpperCase(c)) hasUpper = true;
            else if (Character.isDigit(c)) hasDigit = true;
            else hasSpecial = true;
        }
        
        int typesCount = (hasLower ? 1 : 0) + (hasUpper ? 1 : 0) + (hasDigit ? 1 : 0) + (hasSpecial ? 1 : 0);
        score += typesCount * 15;
        
        return Math.min(100, score);
    }
}
