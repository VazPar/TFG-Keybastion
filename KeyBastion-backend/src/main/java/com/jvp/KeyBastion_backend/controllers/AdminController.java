package com.jvp.KeyBastion_backend.controllers;

import com.jvp.KeyBastion_backend.model.Role;
import com.jvp.KeyBastion_backend.model.User;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

/**
 * Root controller for admin operations.
 * <p>
 * This controller has been refactored and split into smaller, specialized controllers in the
 * com.jvp.KeyBastion_backend.controllers.admin package for better maintainability:
 * - UserAdminController - User management operations
 * - CategoryAdminController - Category management operations
 * - ActivityLogAdminController - Activity log operations
 * - SharingAdminController - Sharing statistics operations
 */
@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController extends BaseController {

    /**
     * Root admin dashboard endpoint.
     * <p>
     * This is a simple endpoint that confirms admin access and provides information about
     * available admin functionalities.
     * 
     * @return Dashboard information
     */
    @GetMapping
    public ResponseEntity<Map<String, Object>> getDashboard() {
        User admin = getCurrentUser();
        
        if (admin.getRole() != Role.ADMIN) {
            return ResponseEntity.status(403).body(Map.of("error", "Unauthorized access"));
        }
        
        Map<String, Object> dashboard = new HashMap<>();
        dashboard.put("admin", Map.of(
            "username", admin.getUsername(),
            "email", admin.getEmail()
        ));
        
        dashboard.put("availableSections", Map.of(
            "users", "/api/admin/users",
            "categories", "/api/admin/categories",
            "logs", "/api/admin/logs",
            "sharing", "/api/admin/sharing/stats"
        ));
        
        return ResponseEntity.ok(dashboard);
    }
}
