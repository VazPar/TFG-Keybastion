package com.jvp.KeyBastion_backend.controllers;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.jvp.KeyBastion_backend.model.Credential;
import com.jvp.KeyBastion_backend.model.User;
import com.jvp.KeyBastion_backend.services.CredentialService;

/**
 * Controller responsible for credential statistics and dashboard data.
 * 
 * This controller provides endpoints for retrieving statistical information about
 * a user's credentials, such as total count, strength distribution, and other
 * metrics useful for dashboard displays and reporting.
 * 
 * Separating these statistics-related operations from the main credential CRUD
 * operations improves code organization and maintainability.
 */
@RestController
@RequestMapping("/api/credential-stats")
public class CredentialStatsController extends BaseController {

    /**
     * Check if the current user has ROLE_USER authority
     * This method verifies that the authenticated user has the appropriate role
     * to access credential-related functionality.
     */
    protected void checkUserRole() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        boolean hasValidRole = authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_USER") || a.getAuthority().equals("ROLE_ADMIN"));
        
        if (!hasValidRole) {
            throw new AccessDeniedException("Only users with appropriate roles can access this resource");
        }
    }

    @Autowired
    private CredentialService credentialService;

    /**
     * Retrieves dashboard statistics for the authenticated user's credentials.
     * 
     * This endpoint computes and returns key metrics about the user's password collection:
     * - Total number of passwords stored
     * - Number of strong passwords (strength score >= 70)
     * - Number of recently added passwords (within the last 7 days)
     * - Number of passwords that need attention (strength score < 50)
     * 
     * These statistics provide users with a quick overview of their password security
     * status and highlight areas that may need improvement.
     * 
     * @return A map containing dashboard statistics
     */
    @GetMapping("/dashboard")
    public ResponseEntity<Map<String, Integer>> getDashboardStats() {
        // Check if user has the correct role
        checkUserRole();
        
        User currentUser = getCurrentUser();
        List<Credential> credentials = credentialService.findCredentialsByUser(currentUser);
        
        // Calculate statistics
        int totalPasswords = credentials.size();
        
        // Count strong passwords (strength >= 70)
        int strongPasswords = (int) credentials.stream()
                .filter(c -> c.getPasswordStrength() >= 70)
                .count();
        
        // Count recently added (last 7 days)
        LocalDateTime oneWeekAgo = LocalDateTime.now().minusDays(7);
        int recentlyAdded = (int) credentials.stream()
                .filter(c -> c.getCreatedAt().isAfter(oneWeekAgo))
                .count();
        
        // Count passwords that need attention (strength < 50)
        int needsAttention = (int) credentials.stream()
                .filter(c -> c.getPasswordStrength() < 50)
                .count();
        
        Map<String, Integer> stats = new HashMap<>();
        stats.put("totalPasswords", totalPasswords);
        stats.put("strongPasswords", strongPasswords);
        stats.put("recentlyAdded", recentlyAdded);
        stats.put("needsAttention", needsAttention);
        
        return ResponseEntity.ok(stats);
    }
}
