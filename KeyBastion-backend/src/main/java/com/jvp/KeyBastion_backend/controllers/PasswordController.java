package com.jvp.KeyBastion_backend.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.CrossOrigin;

import com.jvp.KeyBastion_backend.dto.PasswordEvaluationRequest;
import com.jvp.KeyBastion_backend.dto.PasswordEvaluationResponse;
import com.jvp.KeyBastion_backend.dto.PasswordGenerationRequest;
import com.jvp.KeyBastion_backend.dto.PasswordGenerationResponse;
import com.jvp.KeyBastion_backend.services.PasswordService;

/**
 * REST controller for password-related operations in the KeyBastion application.
 * 
 * This controller provides endpoints for:
 * - Generating secure passwords with customizable criteria
 * - Evaluating the strength of existing passwords
 * 
 * All endpoints are accessible via the /api/passwords base path and
 * support cross-origin requests for frontend integration.
 */
@RestController
@RequestMapping("/api/passwords")
@CrossOrigin(origins = "*")
public class PasswordController {

    /**
     * Service responsible for password generation and strength evaluation operations.
     * Automatically injected by Spring.
     */
    @Autowired
    private PasswordService passwordService;

    /**
     * Generates a secure password based on the provided criteria.
     * 
     * This endpoint accepts customization parameters for password generation including:
     * - Password length
     * - Character type inclusion (lowercase, uppercase, numbers, special characters)
     * 
     * The generated password is automatically evaluated for strength before being returned.
     * 
     * @param request The password generation request containing customization criteria
     * @return A response containing the generated password and its strength score (0-100)
     */
    @PostMapping("/generate")
    public ResponseEntity<PasswordGenerationResponse> generatePassword(@RequestBody PasswordGenerationRequest request) {
        String generatedPassword = passwordService.generatePassword(
                request.getLength(),
                request.isIncludeLowercase(),
                request.isIncludeUppercase(),
                request.isIncludeNumbers(),
                request.isIncludeSpecial());

        int strength = passwordService.evaluatePasswordStrength(generatedPassword);

        return ResponseEntity.ok(new PasswordGenerationResponse(generatedPassword, strength));
    }

    /**
     * Evaluates the strength of a provided password.
     * 
     * This endpoint analyzes a password and returns a numeric score representing its strength.
     * The evaluation considers factors such as:
     * - Password length
     * - Character variety (lowercase, uppercase, numbers, special characters)
     * - Common patterns and sequences
     * 
     * The response includes cache control headers to prevent sensitive data caching.
     * 
     * @param request The request containing the password to evaluate
     * @return A response object containing a score from 0 (very weak) to 100 (very strong)
     */
    @PostMapping("/evaluate")
    public ResponseEntity<PasswordEvaluationResponse> evaluatePassword(@RequestBody PasswordEvaluationRequest request) {
        if (request.getPassword() == null || request.getPassword().isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        int strength = passwordService.evaluatePasswordStrength(request.getPassword());
        return ResponseEntity.ok()
            .header("Cache-Control", "no-cache, no-store, must-revalidate")
            .header("Pragma", "no-cache")
            .header("Expires", "0")
            .body(new PasswordEvaluationResponse(strength));
    }
}
