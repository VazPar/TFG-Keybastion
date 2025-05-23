package com.jvp.KeyBastion_backend.services;

import org.springframework.stereotype.Service;
import com.jvp.KeyBastion_backend.util.PasswordGenerator;

/**
 * Implementation of the PasswordService interface that provides password generation
 * and strength evaluation functionality.
 * 
 * This service uses the PasswordGenerator utility to create secure random passwords
 * based on configurable criteria and evaluate password strength.
 */
@Service
public class PasswordServiceImpl implements PasswordService {
    
    /**
     * The password generator utility used for creating and evaluating passwords.
     */
    private final PasswordGenerator passwordGenerator;
    
    /**
     * Constructs a new PasswordServiceImpl with a fresh PasswordGenerator instance.
     */
    public PasswordServiceImpl() {
        this.passwordGenerator = new PasswordGenerator();
    }
    
    /**
     * Generates a password based on the specified criteria.
     *
     * @param length           The desired length of the password
     * @param includeLowercase Whether to include lowercase letters
     * @param includeUppercase Whether to include uppercase letters
     * @param includeNumbers   Whether to include numeric characters
     * @param includeSpecial   Whether to include special characters
     * @return A securely generated random password matching the criteria
     */
    @Override
    public String generatePassword(int length, boolean includeLowercase, boolean includeUppercase,
                                  boolean includeNumbers, boolean includeSpecial) {
        return passwordGenerator.generatePassword(length, includeLowercase, includeUppercase,
                                                 includeNumbers, includeSpecial);
    }
    
    /**
     * Generates a strong password using default security settings.
     * The generated password will include a mix of character types and
     * be of sufficient length to be considered secure.
     *
     * @return A securely generated strong random password
     */
    @Override
    public String generateStrongPassword() {
        return passwordGenerator.generateStrongPassword();
    }
    
    /**
     * Evaluates the strength of a given password.
     * The evaluation considers factors such as length, character variety,
     * and common patterns to determine a strength score.
     *
     * @param password The password to evaluate
     * @return A numeric score representing the password strength (typically 0-100)
     */
    @Override
    public int evaluatePasswordStrength(String password) {
        return passwordGenerator.evaluatePasswordStrength(password);
    }
}
