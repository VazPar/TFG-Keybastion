package com.jvp.KeyBastion_backend.services;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
//import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.security.oauth2.jwt.JwtException;
import org.springframework.stereotype.Service;

import com.jvp.KeyBastion_backend.auth.AuthUser;
import com.jvp.KeyBastion_backend.dto.AuthDTO.TokenRefreshResponse;
import com.jvp.KeyBastion_backend.dto.AuthDTO.TokenValidationResponse;
//import com.jvp.KeyBastion_backend.repositories.UserRepository;

import lombok.RequiredArgsConstructor;

/**
 * Authentication service implementation that handles token generation, validation, and management.
 * <p>
 * This service is responsible for the secure issuance and validation of JWT tokens for authentication
 * and implements token blacklisting for enhanced security. It properly manages access tokens and
 * refresh tokens, ensuring secure user authentication throughout the application.
 * </p>
 * <p>
 * Security enhancements:
 * <ul>
 *   <li>Added token blacklisting for immediate token revocation on logout</li>
 *   <li>Validation against blacklisted tokens during token verification</li>
 *   <li>Proper JWT claim management including role-based authorization</li>
 * </ul>
 * </p>
 */
@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private static final Logger log = LoggerFactory.getLogger(AuthServiceImpl.class);
    private final JwtEncoder jwtEncoder;
    private final JwtDecoder jwtDecoder;
    //private final PasswordEncoder passwordEncoder;
    //private final UserRepository userRepository;
    private final JpaUserDetailsService userDetailsService;
    private final TokenBlacklistService tokenBlacklistService;
    
    // In-memory store for refresh tokens (in production, use a database)
    private final Map<String, String> refreshTokenStore = new HashMap<>();
    
    // Token expiration times
    private static final long ACCESS_TOKEN_EXPIRY_MINUTES = 30;
    //private static final long REFRESH_TOKEN_EXPIRY_DAYS = 7;

    @Override
    public String generateToken(Authentication authentication) {
        Instant now = Instant.now();
        
        String username = authentication.getName();
        List<String> roles = authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .map(authority -> authority.startsWith("ROLE_") ? authority.substring(5) : authority)
                .collect(Collectors.toList());
        
        // Get the user ID from the UserDetails
        String userId = null;
        if (authentication.getPrincipal() instanceof AuthUser) {
            AuthUser authUser = (AuthUser) authentication.getPrincipal();
            UUID userUuid = authUser.getUser().getId();
            userId = userUuid != null ? userUuid.toString() : null;
        }
        
        // Create JWT token with proper claims
        JwtClaimsSet claims = JwtClaimsSet.builder()
                .issuer("keybastion")
                .issuedAt(now)
                .expiresAt(now.plus(ACCESS_TOKEN_EXPIRY_MINUTES, ChronoUnit.MINUTES))
                .subject(username)
                .claim("roles", roles)
                .claim("username", username)
                .claim("userId", userId)
                .build();

        log.info("Generated JWT token for user: {}, userId: {}", username, userId);
        return jwtEncoder.encode(JwtEncoderParameters.from(claims)).getTokenValue();
    }
    
    /**
     * Generates a token using the user's username
     * 
     * @param username The username to generate a token for
     * @return The generated token
     */
    private String generateToken(String username) {
        Instant now = Instant.now();
        
        // Load user details to get roles
        UserDetails userDetails = userDetailsService.loadUserByUsername(username);
        
        // Get user ID if available
        String userId = null;
        if (userDetails instanceof AuthUser) {
            AuthUser authUser = (AuthUser) userDetails;
            UUID userUuid = authUser.getUser().getId();
            userId = userUuid != null ? userUuid.toString() : null;
        }
        
        // Extract roles
        List<String> roles = userDetails.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .map(authority -> authority.startsWith("ROLE_") ? authority.substring(5) : authority)
                .collect(Collectors.toList());
        
        // Create JWT token with proper claims
        JwtClaimsSet claims = JwtClaimsSet.builder()
                .issuer("keybastion")
                .issuedAt(now)
                .expiresAt(now.plus(ACCESS_TOKEN_EXPIRY_MINUTES, ChronoUnit.MINUTES))
                .subject(username)
                .claim("roles", roles)
                .claim("username", username)
                .claim("userId", userId)
                .build();

        log.info("Generated JWT token for user: {}, userId: {}", username, userId);
        return jwtEncoder.encode(JwtEncoderParameters.from(claims)).getTokenValue();
    }
    
    @Override
    public String generateRefreshToken(String username) {
        // Generate a unique refresh token
        String refreshToken = UUID.randomUUID().toString();
        
        // Store the refresh token with the associated username
        refreshTokenStore.put(refreshToken, username);
        
        log.info("Generated refresh token for user: {}", username);
        return refreshToken;
    }
    
    @Override
    public TokenValidationResponse validateToken(String token) {
        try {
            // SECURITY ENHANCEMENT: Check if token is blacklisted before validation
            if (tokenBlacklistService.isBlacklisted(token)) {
                log.warn("Attempted use of blacklisted token detected");
                return new TokenValidationResponse(false, 0, null, List.of());
            }
            
            Jwt jwt = jwtDecoder.decode(token);
            
            // Extract claims
            String username = jwt.getSubject();
            Instant expiration = jwt.getExpiresAt();
            
            if (expiration != null && expiration.isBefore(Instant.now())) {
                return new TokenValidationResponse(false, 0, username, List.of());
            }
            
            // Get roles from the token
            @SuppressWarnings("unchecked")
            List<String> roles = (List<String>) jwt.getClaims().getOrDefault("roles", List.of());
            
            // Calculate remaining time
            long expiresIn = 0;
            if (expiration != null) {
                expiresIn = Instant.now().until(expiration, ChronoUnit.SECONDS);
            }
            
            return new TokenValidationResponse(true, expiresIn, username, roles);
        } catch (JwtException e) {
            log.error("Token validation failed: {}", e.getMessage());
            return new TokenValidationResponse(false, 0, null, List.of());
        }
    }
    
    /**
     * Refreshes an access token and rotates the refresh token for enhanced security.
     * <p>
     * This security-enhanced implementation implements refresh token rotation, a recommended
     * security practice that:
     * <ul>
     *   <li>Invalidates the old refresh token after a single use</li>
     *   <li>Issues a new refresh token along with the new access token</li>
     *   <li>Reduces the impact of a compromised refresh token</li>
     * </ul>
     * This approach significantly improves security by ensuring refresh tokens
     * cannot be reused, even if intercepted.
     * </p>
     * 
     * @param refreshToken The current refresh token to validate and use
     * @return A response containing both a new access token and a new refresh token
     */
    @Override
    public TokenRefreshResponse refreshToken(String refreshToken) {
        try {
            // Check if the refresh token is valid
            if (!refreshTokenStore.containsKey(refreshToken)) {
                throw new RuntimeException("Refresh token is not valid");
            }
            
            // Get the username associated with the refresh token
            String username = refreshTokenStore.get(refreshToken);
            
            // Invalidate the old refresh token (token rotation security practice)
            refreshTokenStore.remove(refreshToken);
            log.debug("Old refresh token invalidated for user: {}", username);
            
            // Generate a new access token
            String newAccessToken = generateToken(username);
            
            // Generate new refresh token
            String newRefreshToken = generateRefreshToken(username);
            
            log.info("Tokens refreshed with rotation for user: {}", username);
            return new TokenRefreshResponse(
                    newAccessToken, 
                    newRefreshToken, 
                    "Bearer", 
                    ACCESS_TOKEN_EXPIRY_MINUTES * 60);
        } catch (Exception e) {
            log.error("Error during token refresh: {}", e.getMessage());
            throw new RuntimeException("Error during token refresh", e);
        }
    }
    
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
    @Override
    public void invalidateRefreshToken(String refreshToken) {
        if (refreshTokenStore.containsKey(refreshToken)) {
            String username = refreshTokenStore.get(refreshToken);
            refreshTokenStore.remove(refreshToken);
            log.info("Invalidated refresh token for user: {}", username);
        }
    }
    
    /**
     * Blacklists an access token to prevent its further use even if it's not yet expired.
     * <p>
     * This method enhances security by allowing immediate revocation of access tokens,
     * which is important for logout scenarios and security incident response.
     * </p>
     * 
     * @param token The JWT token to blacklist
     */
    public void blacklistAccessToken(String token) {
        try {
            // Decode the token to get its expiration time
            Jwt jwt = jwtDecoder.decode(token);
            Instant expiration = jwt.getExpiresAt();
            
            if (expiration != null && expiration.isAfter(Instant.now())) {
                // Calculate remaining time to live in seconds
                long ttlSeconds = Instant.now().until(expiration, ChronoUnit.SECONDS);
                
                // Add token to blacklist with its remaining TTL
                tokenBlacklistService.blacklistToken(token, ttlSeconds);
                
                log.info("Access token blacklisted for user: {}, TTL: {} seconds", 
                        jwt.getSubject(), ttlSeconds);
            }
        } catch (JwtException e) {
            log.error("Failed to blacklist invalid token: {}", e.getMessage());
        }
    }
}
