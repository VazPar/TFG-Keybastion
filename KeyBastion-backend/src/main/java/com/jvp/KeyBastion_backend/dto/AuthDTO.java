package com.jvp.KeyBastion_backend.dto;

import java.util.List;

import com.jvp.KeyBastion_backend.model.Role;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Builder;

public class AuthDTO {

    // For login
    public record LoginRequest(
            @NotBlank String username,
            @NotBlank String password) {
    }

    public record JwtResponse(
            String access_token,
            String refresh_token,
            String token_type,
            long expires_in,
            String username,
            List<String> roles) {
    }

    // For token refresh
    public record TokenRefreshRequest(
            @NotBlank String refreshToken) {
    }

    public record TokenRefreshResponse(
            String accessToken,
            String refreshToken,
            String tokenType,
            long expiresIn) {
    }

    // For user registration
    @Builder
    public record RegisterRequest(
            @NotBlank String username,
            @NotBlank String password,
            @NotNull Role role,
            @Email @NotBlank String email) {
    }
    
    // For token validation
    public record TokenValidationRequest(
            @NotBlank String token) {
    }
    
    public record TokenValidationResponse(
            boolean valid,
            long expiresIn,
            String username,
            List<String> roles) {
    }
}
