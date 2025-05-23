package com.jvp.KeyBastion_backend.dto;

import lombok.Data;

/**
 * Data Transfer Object for password generation requests.
 * 
 * This class encapsulates all parameters needed for generating a password with specific criteria.
 * It is used to transfer password generation requirements from the client to the server.
 * Default values are provided for all fields to ensure a reasonable password is generated
 * even if some parameters are not explicitly specified.
 */
@Data
public class PasswordGenerationRequest {
    /**
     * The desired length of the generated password.
     * Default value is 12 characters, which provides a good balance of security and usability.
     */
    private int length = 12;
    
    /**
     * Whether to include lowercase letters (a-z) in the generated password.
     * Default is true for better character variety.
     */
    private boolean includeLowercase = true;
    
    /**
     * Whether to include uppercase letters (A-Z) in the generated password.
     * Default is true for better character variety.
     */
    private boolean includeUppercase = true;
    
    /**
     * Whether to include numeric digits (0-9) in the generated password.
     * Default is true for better character variety.
     */
    private boolean includeNumbers = true;
    
    /**
     * Whether to include special characters (e.g., !@#$%^&*) in the generated password.
     * Default is true for maximum security.
     */
    private boolean includeSpecial = true;
}
