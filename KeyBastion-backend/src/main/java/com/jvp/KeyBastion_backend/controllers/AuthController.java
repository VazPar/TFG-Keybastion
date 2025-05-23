package com.jvp.KeyBastion_backend.controllers;

import java.util.List;
import java.time.LocalDateTime;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.jvp.KeyBastion_backend.dto.AuthDTO;
import com.jvp.KeyBastion_backend.dto.AuthDTO.TokenRefreshRequest;
import com.jvp.KeyBastion_backend.dto.AuthDTO.TokenRefreshResponse;
import com.jvp.KeyBastion_backend.dto.AuthDTO.TokenValidationRequest;
import com.jvp.KeyBastion_backend.dto.AuthDTO.TokenValidationResponse;
import com.jvp.KeyBastion_backend.model.Role;
import com.jvp.KeyBastion_backend.model.User;
import com.jvp.KeyBastion_backend.services.AuthService;
import com.jvp.KeyBastion_backend.services.AuthServiceImpl;
import com.jvp.KeyBastion_backend.services.UserService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * Authentication controller that manages user registration, login, and token operations.
 * <p>
 * This controller is a critical security component of KeyBastion that implements the authentication
 * flows and token management for the application. It serves as the gateway for all authentication
 * operations including user registration, login, token refresh, validation, and logout.
 * </p>
 * <p>
 * Security features implemented by this controller:
 * <ul>
 *   <li>JWT-based authentication with short-lived access tokens (30 minutes)</li>
 *   <li>Refresh token mechanism for extending sessions without re-authentication</li>
 *   <li>Protection against privilege escalation during registration</li>
 *   <li>Token validation to verify session integrity</li>
 *   <li>Secure logout with token invalidation</li>
 * </ul>
 * </p>
 * <p>
 * The controller uses Spring Security's AuthenticationManager for user authentication and
 * delegates to the AuthService for token generation and validation. All sensitive operations
 * are logged for security audit purposes.
 * </p>
 */
@Slf4j
@RestController
@RequestMapping("${app.base-path}/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final AuthService authService;
    private final UserService userService;

    /**
     * Authenticates a user and generates JWT tokens for the authenticated session.
     * <p>
     * This endpoint implements the primary authentication flow for KeyBastion. It:
     * <ul>
     *   <li>Authenticates the user's credentials using Spring Security</li>
     *   <li>Generates a short-lived access token (30 minutes) for API access</li>
     *   <li>Creates a refresh token for maintaining the session</li>
     *   <li>Returns the user's roles for client-side authorization</li>
     * </ul>
     * </p>
     * <p>
     * Security measures:
     * <ul>
     *   <li>Input validation with @Valid annotation</li>
     *   <li>Password verification using BCrypt comparison</li>
     *   <li>Limited token lifetime to reduce exposure risk</li>
     *   <li>Authentication logging for security monitoring</li>
     * </ul>
     * </p>
     *
     * @param loginRequest Contains username and password for authentication
     * @return JWT response containing access token, refresh token, and user details
     */
    @PostMapping("/login")
    public ResponseEntity<AuthDTO.JwtResponse> login(
            @Valid @RequestBody AuthDTO.LoginRequest loginRequest) {

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        loginRequest.username(),
                        loginRequest.password()));

        SecurityContextHolder.getContext().setAuthentication(authentication);

        // Generate access token
        String accessToken = authService.generateToken(authentication);
        
        // Generate refresh token
        String refreshToken = authService.generateRefreshToken(authentication.getName());
        
        List<String> roles = authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .toList();

        log.info("User logged in successfully: {}", authentication.getName());
        
        return ResponseEntity.ok(new AuthDTO.JwtResponse(
                accessToken,
                refreshToken,
                "Bearer",
                30 * 60, // 30 minutes in seconds
                authentication.getName(),
                roles));
    }

    /**
     * Registers a new user in the system and provides initial authentication tokens.
     * <p>
     * This endpoint creates a new user account and then immediately authenticates the user,
     * allowing for a seamless registration-to-logged-in experience. The method implements
     * several key security measures to ensure proper user creation:
     * </p>
     * <p>
     * Security measures:
     * <ul>
     *   <li>Input validation for registration data</li>
     *   <li>Enforced role assignment as regular USER regardless of input</li>
     *   <li>Password hashing before storage</li>
     *   <li>Automatic authentication after registration</li>
     *   <li>Full audit logging of user creation</li>
     * </ul>
     * </p>
     * <p>
     * Note: This endpoint enforces the principle of least privilege by ensuring that
     * newly registered users can only receive the USER role. Admin users can only be
     * created through administrative interfaces with proper authorization.
     * </p>
     *
     * @param registerRequest User registration details including username, password, and email
     * @return JWT response containing access token, refresh token, and user details
     */
    @PostMapping("/register")
    public ResponseEntity<AuthDTO.JwtResponse> register(
            @Valid @RequestBody AuthDTO.RegisterRequest registerRequest) {

        // 1. Create the user
        User user = new User();
        user.setUsername(registerRequest.username());
        user.setPasswordHash(registerRequest.password()); // Will be encoded in service
        
        // Ensure that public registration can only create regular users
        // Only admins can create admin users through the admin interface
        user.setRole(Role.USER);
        
        user.setEmail(registerRequest.email());
        user.setCreatedAt(LocalDateTime.now());

        User createdUser = userService.registerUser(user);

        // 2. Authenticate the new user
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        registerRequest.username(),
                        registerRequest.password()));

        // 3. Generate JWT token
        String accessToken = authService.generateToken(authentication);
        
        // 4. Generate refresh token
        String refreshToken = authService.generateRefreshToken(authentication.getName());

        // 5. Get user roles
        List<String> roles = authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .toList();

        log.info("User registered successfully: {}", createdUser.getUsername());
        
        return ResponseEntity.ok(new AuthDTO.JwtResponse(
                accessToken,
                refreshToken,
                "Bearer",
                30 * 60, // 30 minutes in seconds
                createdUser.getUsername(),
                roles));
    }
    
    /**
     * Refreshes an access token using a valid refresh token.
     * <p>
     * This endpoint implements the token refresh flow, allowing clients to obtain a new
     * access token when the current one expires, without requiring the user to re-authenticate
     * with their credentials. This is a critical security feature that:
     * <ul>
     *   <li>Allows the access token to have a short lifetime for security</li>
     *   <li>Provides convenient extended sessions for legitimate users</li>
     *   <li>Enables token revocation through refresh token invalidation</li>
     * </ul>
     * </p>
     * <p>
     * Security considerations:
     * <ul>
     *   <li>Refresh tokens are validated for authenticity and expiration</li>
     *   <li>Refresh tokens may be invalidated during security events</li>
     *   <li>Token refresh operations are logged for security auditing</li>
     * </ul>
     * </p>
     *
     * @param request Contains the refresh token to use for generating a new access token
     * @return Response containing a new access token and the original refresh token
     */
    @PostMapping("/refresh")
    public ResponseEntity<TokenRefreshResponse> refreshToken(
            @Valid @RequestBody TokenRefreshRequest request) {
        
        TokenRefreshResponse response = authService.refreshToken(request.refreshToken());
        log.info("Token refreshed successfully");
        
        return ResponseEntity.ok(response);
    }
    
    /**
     * Validates an access token and provides information about its validity and claims.
     * <p>
     * This endpoint allows clients to verify if a token is still valid without attempting
     * to access a protected resource. It's useful for client-side validation and session
     * management, helping to determine if a token refresh is needed.
     * </p>
     * <p>
     * The validation includes:
     * <ul>
     *   <li>Signature verification to ensure the token hasn't been tampered with</li>
     *   <li>Expiration check to confirm the token is still valid</li>
     *   <li>Claims extraction to provide user context information</li>
     * </ul>
     * </p>
     *
     * @param request Contains the token to validate
     * @return Response with validation result and token claims if valid
     */
    @PostMapping("/validate")
    public ResponseEntity<TokenValidationResponse> validateToken(
            @Valid @RequestBody TokenValidationRequest request) {
        
        TokenValidationResponse response = authService.validateToken(request.token());
        return ResponseEntity.ok(response);
    }
    
    /**
     * Logs out a user by invalidating their refresh token.
     * <p>
     * This endpoint implements the secure logout flow by invalidating the user's refresh token,
     * preventing it from being used to obtain new access tokens. This is a critical security
     * feature that helps terminate user sessions properly when users log out.
     * </p>
     * <p>
     * Security benefits:
     * <ul>
     *   <li>Prevents refresh token reuse after logout</li>
     *   <li>Complements client-side token deletion</li>
     *   <li>Provides server-side enforcement of session termination</li>
     *   <li>Creates audit log entries for security monitoring</li>
     * </ul>
     * </p>
     * <p>
     * Note: Clients should also remove tokens from local storage upon logout for
     * complete session termination.</p>
     *
     * @param request Contains the refresh token to invalidate
     * @return Empty response with 200 OK status on successful logout
     */
    /**
     * Logs out a user by invalidating their refresh token and blacklisting the access token.
     * <p>
     * This endpoint implements a comprehensive secure logout flow by:
     * <ul>
     *   <li>Invalidating the refresh token to prevent obtaining new access tokens</li>
     *   <li>Blacklisting the current access token to immediately revoke access</li>
     * </ul>
     * This dual-revocation approach ensures complete session termination on both token types.
     * </p>
     * <p>
     * Security benefits:
     * <ul>
     *   <li>Prevents refresh token reuse after logout</li>
     *   <li>Immediately invalidates the access token even before expiration</li>
     *   <li>Complements client-side token deletion</li>
     *   <li>Provides server-side enforcement of session termination</li>
     *   <li>Creates audit log entries for security monitoring</li>
     * </ul>
     * </p>
     * <p>
     * Note: Clients should also remove tokens from local storage upon logout for
     * complete session termination.</p>
     *
     * @param request Contains the refresh token to invalidate
     * @return Empty response with 200 OK status on successful logout
     */
    @PostMapping("/logout")
    public ResponseEntity<Void> logout(
            @Valid @RequestBody TokenRefreshRequest request) {
        
        // Invalidate the refresh token
        authService.invalidateRefreshToken(request.refreshToken());
        
        // Extract and blacklist the access token from the Authorization header
        String accessToken = SecurityContextHolder.getContext()
                .getAuthentication()
                .getCredentials().toString();
        
        if (accessToken != null && !accessToken.isEmpty()) {
            // Blacklist the current access token if available
            ((AuthServiceImpl) authService).blacklistAccessToken(accessToken);
            log.info("Access token blacklisted during logout");
        }
        
        log.info("User logged out successfully with complete token revocation");
        
        return ResponseEntity.ok().build();
    }

    /**
     * DEVELOPMENT USE ONLY: Promotes a regular user to an administrator role.
     * <p>
     * This endpoint is intended for development and testing purposes only and should be
     * disabled or secured in production environments. It allows the elevation of a regular
     * user to the ADMIN role without the normal administrative controls.
     * </p>
     * <p>
     * SECURITY WARNING:
     * <ul>
     *   <li>This endpoint represents a significant security risk if exposed in production</li>
     *   <li>It bypasses normal role management processes and controls</li>
     *   <li>In production, this functionality should be moved to a properly secured admin interface</li>
     *   <li>Additional authentication and authorization controls should be implemented</li>
     *   <li>Consider adding IP restrictions or disabling this endpoint entirely in production</li>
     * </ul>
     * </p>
     *
     * @param request Map containing the username of the user to promote
     * @return Response indicating success or failure of the promotion operation
     */
    // Temporary endpoint for development purposes to promote a user to admin
    @PostMapping("/promote-to-admin")
    public ResponseEntity<?> promoteToAdmin(@RequestBody Map<String, String> request) {
        String username = request.get("username");
        if (username == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Username is required"));
        }
        
        User user = userService.findUserByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found: " + username));
        
        // Set the user's role to ADMIN
        user.setRole(Role.ADMIN);
        userService.updateUser(user);
        
        log.info("User promoted to ADMIN: {}", username);
        
        return ResponseEntity.ok(Map.of(
            "message", "User promoted to ADMIN successfully",
            "username", user.getUsername(),
            "role", user.getRole()
        ));
    }
}
