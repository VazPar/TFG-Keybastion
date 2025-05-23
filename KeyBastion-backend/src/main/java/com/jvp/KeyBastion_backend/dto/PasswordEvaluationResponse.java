package com.jvp.KeyBastion_backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Data Transfer Object for password evaluation responses.
 * 
 * This class encapsulates the result of a password strength evaluation,
 * providing a standardized response format for the password evaluation API.
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
public class PasswordEvaluationResponse {
    /**
     * The strength score of the evaluated password.
     * This value ranges from 0 (very weak) to 100 (very strong).
     */
    private int strength;
}
