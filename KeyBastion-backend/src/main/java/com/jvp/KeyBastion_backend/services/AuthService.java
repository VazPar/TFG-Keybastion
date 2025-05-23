package com.jvp.KeyBastion_backend.services;

import org.springframework.security.core.Authentication;

import com.jvp.KeyBastion_backend.dto.AuthDTO.TokenRefreshResponse;
import com.jvp.KeyBastion_backend.dto.AuthDTO.TokenValidationResponse;

/**
 * Authentication service interface that defines security-critical token operations for KeyBastion.
 * <p>
 * This interface defines the contract for KeyBastion's authentication system and token lifecycle
 * management. It is a core security component responsible for generating and validating JWT tokens,
 * managing refresh tokens, and enforcing proper authentication flows.
 * </p>
 * <p>
 * Security responsibilities of this service include:
 * <ul>
 *   <li>Secure generation of JWT access tokens with appropriate claims and expiration</li>
 *   <li>Management of longer-lived refresh tokens for session continuity</li>
 *   <li>Token validation to prevent forgery or tampering</li>
 *   <li>Token revocation during security events (logout, suspected breach)</li>
 * </ul>
 * </p>
 * <p>
 * This service is used primarily by the AuthController to implement the authentication
 * endpoints and by security filters to validate tokens during request processing.
 * </p>
 */
public interface AuthService {

    /**
     * Generates a cryptographically secure JWT access token for the authenticated user.
     * <p>
     * This method creates a signed JWT token containing the user's identity and authorization
     * claims (roles). The token is signed using the application's RSA private key to ensure
     * its authenticity and integrity.
     * </p>
     * <p>
     * Security features of generated tokens:
     * <ul>
     *   <li>Short expiration time (typically 30 minutes) to limit exposure</li>
     *   <li>RSA-256 signature to prevent tampering</li>
     *   <li>Inclusion of only necessary user claims to minimize sensitive data</li>
     *   <li>Standard JWT format for compatibility with security systems</li>
     * </ul>
     * </p>
     *
     * @param authentication The Spring Security authentication object containing user details
     * @return The generated JWT token as a string
     */
    String generateToken(Authentication authentication);
    
    /**
     * Generates a unique refresh token for extending user sessions.
     * <p>
     * Refresh tokens are a critical security component that allow for short-lived access tokens
     * while maintaining user session persistence. This method creates a refresh token that is:
     * <ul>
     *   <li>Associated with a specific user account</li>
     *   <li>Securely stored for future validation</li>
     *   <li>Given a longer expiration time than access tokens (typically hours or days)</li>
     *   <li>Designed to be used only for obtaining new access tokens</li>
     * </ul>
     * </p>
     * <p>
     * Security note: Refresh tokens are high-value security assets since they represent
     * long-term authentication capability. Their storage, transmission, and validation
     * require careful security consideration.
     * </p>
     *
     * @param username The username for which to generate the refresh token
     * @return The generated refresh token as a string
     */
    String generateRefreshToken(String username);
    
    /**
     * Validates the authenticity, integrity, and expiration status of a JWT token.
     * <p>
     * This method performs comprehensive validation of JWT tokens, including:
     * <ul>
     *   <li>Signature verification using the public key</li>
     *   <li>Expiration time checking</li>
     *   <li>Token structure and claim validation</li>
     * </ul>
     * </p>
     * <p>
     * The validation process ensures that the token has not been tampered with, is not
     * expired, and was issued by this application. This is a critical security function
     * that helps prevent unauthorized access through token forgery or replay attacks.
     * </p>
     *
     * @param token The JWT token to validate
     * @return TokenValidationResponse containing validation results and token claims if valid
     */
    TokenValidationResponse validateToken(String token);
    
    /**
     * Issues a new access token using a valid refresh token, enabling secure session extension.
     * <p>
     * This method implements the token refresh flow, a critical security mechanism that allows:
     * <ul>
     *   <li>Short-lived access tokens for security</li>
     *   <li>Continuous user experience without frequent re-authentication</li>
     *   <li>The ability to revoke access through refresh token invalidation</li>
     * </ul>
     * </p>
     * <p>
     * Security validations performed:
     * <ul>
     *   <li>Verification that the refresh token exists and is valid</li>
     *   <li>Checking that the refresh token has not been revoked or expired</li>
     *   <li>Authentication of the user associated with the refresh token</li>
     * </ul>
     * </p>
     *
     * @param refreshToken The refresh token to validate and use for token refresh
     * @return TokenRefreshResponse containing a new access token and the refresh token
     * @throws RuntimeException if the refresh token is invalid, expired, or revoked
     */
    TokenRefreshResponse refreshToken(String refreshToken);
    
    /**
     * Invalidates a refresh token to enforce session termination.
     * <p>
     * This method is a critical security function that revokes a refresh token, typically
     * during user logout or when a security breach is suspected. Invalidation prevents
     * the token from being used to obtain new access tokens, effectively terminating
     * the user's session from a server-side perspective.
     * </p>
     * <p>
     * This operation is essential for proper security hygiene as it ensures that:
     * <ul>
     *   <li>Users can explicitly terminate their sessions</li>
     *   <li>Compromised refresh tokens can be quickly revoked</li>
     *   <li>Logout operations have server-side enforcement</li>
     *   <li>Expired sessions cannot be accidentally reactivated</li>
     * </ul>
     * </p>
     *
     * @param refreshToken The refresh token to invalidate
     */
    void invalidateRefreshToken(String refreshToken);
}
