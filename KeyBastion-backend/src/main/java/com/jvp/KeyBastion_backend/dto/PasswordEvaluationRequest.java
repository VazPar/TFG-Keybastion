package com.jvp.KeyBastion_backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Data Transfer Object for password evaluation requests.
 * 
 * This class encapsulates the password that needs to be evaluated for strength.
 * It provides a more type-safe alternative to using a generic Map.
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
public class PasswordEvaluationRequest {
    /**
     * The password to evaluate for strength.
     * This field will be used by the password strength evaluation algorithm.
     */
    private String password;
}
