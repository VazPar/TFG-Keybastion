package com.jvp.KeyBastion_backend.controllers.admin;

import com.jvp.KeyBastion_backend.controllers.BaseController;
import com.jvp.KeyBastion_backend.dto.AdminDTO.AdminUserCreationRequest;
import com.jvp.KeyBastion_backend.model.Role;
import com.jvp.KeyBastion_backend.model.User;
import com.jvp.KeyBastion_backend.services.ActivityLogService;
import com.jvp.KeyBastion_backend.services.UserService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Controller for admin user management operations.
 */
@RestController
@RequestMapping("/api/admin/users")
@PreAuthorize("hasRole('ADMIN')")
public class UserAdminController extends BaseController {

    @Autowired
    private ActivityLogService activityLogService;
    
    @Autowired
    private UserService userService;
    
    /**
     * Creates a new user with admin privileges.
     *
     * @param request The user creation request
     * @return Response with created user details or error
     */
    @PostMapping
    public ResponseEntity<?> createAdminUser(@RequestBody AdminUserCreationRequest request) {
        User admin = getCurrentUser();
        
        if (admin.getRole() != Role.ADMIN) {
            return ResponseEntity.status(403).body(Map.of("error", "Unauthorized access"));
        }

        // Validate request
        if (request.getUsername() == null || request.getEmail() == null || request.getPassword() == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Username, email and password are required"));
        }

        // Check if username or email already exists
        if (userService.existsByUsername(request.getUsername())) {
            return ResponseEntity.badRequest().body(Map.of("error", "Username already exists"));
        }

        if (userService.existsByEmail(request.getEmail())) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email already exists"));
        }

        // Create new user with the specified role
        User newUser = new User();
        newUser.setUsername(request.getUsername());
        newUser.setEmail(request.getEmail());
        newUser.setPasswordHash(request.getPassword()); // Will be hashed in the service

        // Set role based on request, defaulting to USER if not specified
        Role userRole = Role.USER;
        if (request.getRole() != null) {
            try {
                userRole = Role.valueOf(request.getRole().toUpperCase());
            } catch (IllegalArgumentException e) {
                return ResponseEntity.badRequest().body(Map.of("error", "Invalid role specified"));
            }
        }
        newUser.setRole(userRole);

        User createdUser = userService.registerUser(newUser);

        // Log activity
        activityLogService.createAndLogActivity(
            admin,
            userRole == Role.ADMIN ? "CREATE_ADMIN" : "CREATE_USER",
            "Created " + userRole.toString().toLowerCase() + " user: " + createdUser.getUsername(),
            getClientIp()
        );

        Map<String, Object> response = new HashMap<>();
        response.put("id", createdUser.getId());
        response.put("username", createdUser.getUsername());
        response.put("email", createdUser.getEmail());
        response.put("role", createdUser.getRole());
        response.put("message", "User created successfully. User must change password on first login.");

        return ResponseEntity.ok(response);
    }

    /**
     * Gets all users in the system.
     *
     * @return List of users
     */
    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getAllUsers() {
        User admin = getCurrentUser();
        
        if (admin.getRole() != Role.ADMIN) {
            return ResponseEntity.status(403).body(List.of(Map.of("error", "Unauthorized access")));
        }

        List<User> users = userService.getAllUsers();

        // Log activity
        activityLogService.createAndLogActivity(
            admin,
            "VIEW_ALL_USERS",
            "Admin viewed all users",
            getClientIp()
        );

        // Convert to DTO with only necessary information
        List<Map<String, Object>> userDtos = users.stream()
                .map(user -> {
                    Map<String, Object> dto = new HashMap<>();
                    dto.put("id", user.getId());
                    dto.put("username", user.getUsername());
                    dto.put("email", user.getEmail());
                    dto.put("role", user.getRole());
                    dto.put("createdAt", user.getCreatedAt());
                    return dto;
                })
                .collect(Collectors.toList());

        return ResponseEntity.ok(userDtos);
    }
}
