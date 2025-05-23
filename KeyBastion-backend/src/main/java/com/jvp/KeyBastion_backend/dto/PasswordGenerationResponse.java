package com.jvp.KeyBastion_backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Data Transfer Object for password generation responses.
 * 
 * This class encapsulates the result of a password generation operation,
 * including both the generated password and its evaluated strength score.
 * It is used to transfer the generated password data from the server to the client.
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
public class PasswordGenerationResponse {
    /**
     * The generated password string.
     * This is the actual password that was created based on the specified criteria.
     */
    private String password;
    
    /**
     * The strength score of the generated password.
     * This is a numeric value typically ranging from 0 (very weak) to 100 (very strong).
     * The score is calculated based on factors like length, character variety, and patterns.
     */
    private int strength;
}
