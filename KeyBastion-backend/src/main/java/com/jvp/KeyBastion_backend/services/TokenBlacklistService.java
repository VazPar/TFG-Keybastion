package com.jvp.KeyBastion_backend.services;

import org.springframework.stereotype.Service;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;
import java.time.Instant;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Service for managing blacklisted (revoked) tokens in KeyBastion.
 * <p>
 * This service implements a secure token blacklisting mechanism that allows the
 * application to invalidate tokens during security-critical events such as user
 * logout, potential security breaches, or detected suspicious activities.
 * </p>
 * <p>
 * Token blacklisting is a critical security feature that complements JWT-based
 * authentication by providing the ability to revoke tokens before their natural
 * expiration time. This addresses one of the key limitations of stateless JWT tokens.
 * </p>
 * <p>
 * Implementation notes:
 * <ul>
 *   <li>In-memory implementation with scheduled cleanup for simplicity</li>
 *   <li>For production environments, consider using Redis or another distributed cache</li>
 *   <li>The implementation automatically purges expired tokens to prevent memory leaks</li>
 * </ul>
 * </p>
 */
@Service
public class TokenBlacklistService {
    private static final Logger logger = LoggerFactory.getLogger(TokenBlacklistService.class);
    
    // Map to store blacklisted tokens with their expiration time
    private final Map<String, Instant> blacklistedTokens = new ConcurrentHashMap<>();
    
    // Executor service for scheduled cleanup of expired tokens
    private final ScheduledExecutorService cleanupExecutor;
    
    /**
     * Constructor that initializes the token blacklist service with a scheduled
     * cleanup task to remove expired tokens.
     */
    public TokenBlacklistService() {
        cleanupExecutor = Executors.newSingleThreadScheduledExecutor();
        
        // Schedule periodic cleanup of expired tokens (every 15 minutes)
        cleanupExecutor.scheduleAtFixedRate(
            this::cleanupExpiredTokens,
            15, 15, TimeUnit.MINUTES
        );
        
        logger.info("Token blacklist service initialized with scheduled cleanup");
    }
    
    /**
     * Adds a token to the blacklist with a specified time-to-live.
     * <p>
     * This method should be called whenever a token needs to be invalidated,
     * typically during logout or when suspicious activity is detected.
     * </p>
     *
     * @param token The token to blacklist
     * @param ttlSeconds The time-to-live in seconds (typically matching the token's remaining validity)
     */
    public void blacklistToken(String token, long ttlSeconds) {
        Instant expiryTime = Instant.now().plusSeconds(ttlSeconds);
        blacklistedTokens.put(token, expiryTime);
        logger.debug("Token added to blacklist with expiry of {} seconds", ttlSeconds);
    }
    
    /**
     * Checks if a token is blacklisted (revoked).
     * <p>
     * This method should be called during token validation to ensure that
     * revoked tokens are not accepted even if they are otherwise valid.
     * </p>
     *
     * @param token The token to check
     * @return true if the token is blacklisted, false otherwise
     */
    public boolean isBlacklisted(String token) {
        Instant expiryTime = blacklistedTokens.get(token);
        
        if (expiryTime == null) {
            return false; // Token is not in the blacklist
        }
        
        if (Instant.now().isAfter(expiryTime)) {
            // Token has expired, remove it from the blacklist
            blacklistedTokens.remove(token);
            return false;
        }
        
        return true; // Token is blacklisted and still within TTL
    }
    
    /**
     * Cleans up expired tokens from the blacklist to prevent memory leaks.
     * <p>
     * This method is called automatically by the scheduled executor service.
     * </p>
     */
    private void cleanupExpiredTokens() {
        Instant now = Instant.now();
        int initialSize = blacklistedTokens.size();
        
        blacklistedTokens.entrySet().removeIf(entry -> now.isAfter(entry.getValue()));
        
        int removedCount = initialSize - blacklistedTokens.size();
        if (removedCount > 0) {
            logger.debug("Cleaned up {} expired tokens from blacklist", removedCount);
        }
    }
}
