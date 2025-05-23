package com.jvp.KeyBastion_backend.services;

import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

import java.util.Optional;

/**
 * Extended user details service with JPA-specific operations
 */
public interface JpaUserDetailsService extends UserDetailsService {

    /**
     * Load user by username (from UserDetailsService)
     */
    UserDetails loadUserByUsername(String username) throws UsernameNotFoundException;

    /**
     * Find user details by username (returns Optional)
     */
    Optional<UserDetails> findUserByUsername(String username);

    /**
     * Check if a user exists with the given username
     */
    boolean userExists(String username);
}
