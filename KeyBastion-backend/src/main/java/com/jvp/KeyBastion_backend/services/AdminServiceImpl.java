package com.jvp.KeyBastion_backend.services;

import com.jvp.KeyBastion_backend.dto.AdminDTO.AdminUserCreationRequest;
import com.jvp.KeyBastion_backend.dto.AdminDTO.CategoryStatsResponse;
import com.jvp.KeyBastion_backend.dto.AdminDTO.SharingStatsResponse;
import com.jvp.KeyBastion_backend.model.ActivityLog;
import com.jvp.KeyBastion_backend.model.Category;
import com.jvp.KeyBastion_backend.model.Role;
import com.jvp.KeyBastion_backend.model.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * Implementation of AdminService for KeyBastion.
 * <p>
 * Provides admin-only operations such as user management, activity log retrieval,
 * statistics, and global category management. This class contains the business logic
 * for all admin features and coordinates with other services.
 */
@Service
public class AdminServiceImpl implements AdminService {
    @Autowired
    private UserService userService;
    @Autowired
    private CategoryService categoryService;
    @Autowired
    private ActivityLogService activityLogService;
    @Autowired
    private SharingService sharingService;
    @Autowired
    private CredentialService credentialService;

    /**
     * Creates a new admin user with the given details and logs the action.
     *
     * @param request   Data for the new admin user (username, email, password)
     * @param ipAddress IP address from which the admin creation was requested
     * @return The created User object with admin role
     * @throws IllegalArgumentException if required fields are missing
     */
    @Override
    public User createAdminUser(AdminUserCreationRequest request, String ipAddress) {
        // Validate input for required fields
        if (request == null || request.getUsername() == null || request.getEmail() == null || request.getPassword() == null) {
            throw new IllegalArgumentException("Missing required fields for admin creation");
        }
        // Create new User object and set properties
        User newUser = new User();
        newUser.setUsername(request.getUsername());
        newUser.setEmail(request.getEmail());
        newUser.setPasswordHash(request.getPassword()); // UserService should hash this
        newUser.setRole(Role.ADMIN);
        newUser.setCreatedAt(java.time.LocalDateTime.now());
        // Register the new admin user via UserService
        User created = userService.registerUser(newUser);
        // Log admin creation action for audit trail
        ActivityLog adminLog = new ActivityLog();
        adminLog.setUser(created);
        adminLog.setAction("CREATE_ADMIN");
        adminLog.setTimestamp(LocalDateTime.now());
        adminLog.setIpAddress(ipAddress);
        activityLogService.logActivity(adminLog);
        return created;
    }

    /**
     * Retrieves all activity logs, optionally filtered by action type and date range.
     *
     * @param action    Action type to filter by (e.g., CREATE, UPDATE, DELETE) or null for all
     * @param startDate Start date for filtering (inclusive) or null
     * @param endDate   End date for filtering (inclusive) or null
     * @return List of ActivityLog entries matching the filters
     */
    @Override
    public List<ActivityLog> getAllActivityLogs(String action, LocalDateTime startDate, LocalDateTime endDate) {
        // Filter logs as needed using available methods
        // Retrieve all activity logs from the ActivityLogService
        List<ActivityLog> logs = activityLogService.findAllActivityLogs();
        // Optionally filter logs by action type
        if (action != null) {
            logs = logs.stream().filter(log -> action.equals(log.getAction())).toList();
        }
        // Optionally filter logs by date range
        if (startDate != null && endDate != null) {
            logs = logs.stream().filter(log -> !log.getTimestamp().isBefore(startDate) && !log.getTimestamp().isAfter(endDate)).toList();
        }
        return logs;
    }

    /**
     * Retrieves all activity logs for a specific user.
     *
     * @param userId The UUID of the user whose logs to retrieve
     * @return List of ActivityLog entries for the user
     */
    @Override
    public List<ActivityLog> getUserActivityLogs(UUID userId) {
        // Find all logs and filter by userId
        // Retrieve all activity logs and filter by the given userId
        List<ActivityLog> logs = activityLogService.findAllActivityLogs();
        return logs.stream().filter(log -> log.getUser() != null && userId.equals(log.getUser().getId())).toList();
    }

    /**
     * Gathers statistics on how many credentials belong to each category.
     *
     * @return List of CategoryStatsResponse with category names and credential counts
     */
    @Override
    public List<CategoryStatsResponse> getCategoryStats() {
        // Gather all categories and count credentials for each
        List<Category> categories = categoryService.findAllCategories();
        List<CategoryStatsResponse> stats = new java.util.ArrayList<>();
        for (Category cat : categories) {
            long count = credentialService.countCredentialsByCategory(cat);
            stats.add(new CategoryStatsResponse(cat.getName(), count));
        }
        return stats;
    }

    /**
     * Gathers statistics on credential sharing for each user.
     *
     * @return List of SharingStatsResponse with username and number of active sharings
     */
    @Override
    public List<SharingStatsResponse> getSharingStats() {
        // Example: count sharings per user
        // For each user, count the number of active sharings and build stats
        List<User> users = userService.getAllUsers();
        List<SharingStatsResponse> stats = new java.util.ArrayList<>();
        for (User user : users) {
            int activeSharings = sharingService.countActiveSharingsByUser(user);
            stats.add(new SharingStatsResponse(user.getUsername(), (long)activeSharings));
        }
        return stats;
    }

    /**
     * Retrieves all global categories in the system.
     *
     * @return List of Category objects
     */
    @Override
    public List<Category> getAllCategories() {
        // Retrieve all global categories from the CategoryService
        return categoryService.findAllCategories();
    }

    /**
     * Creates a new global category (not owned by any user), logs the action.
     *
     * @param category  The category to create (should not be null)
     * @param admin     The admin performing the action (should not be null)
     * @param ipAddress IP address from which the request was made
     * @return The saved Category object
     * @throws IllegalArgumentException if category or admin is null
     */
    @Override
    public Category createGlobalCategory(Category category, User admin, String ipAddress) {
        // Validate input for required fields
        if (category == null || admin == null) {
            throw new IllegalArgumentException("Category and admin must not be null");
        }
        // Set as global category (not owned by any specific user)
        category.setUser(null); // Global category should not be owned by a specific user
        category.setGlobal(true);
        // Save the global category
        Category saved = categoryService.saveCategory(category);
        // Log the action for audit trail
        ActivityLog categoryLog = new ActivityLog();
        categoryLog.setUser(admin);
        categoryLog.setAction("CREATE_GLOBAL_CATEGORY");
        categoryLog.setTimestamp(LocalDateTime.now());
        categoryLog.setIpAddress(ipAddress);
        activityLogService.logActivity(categoryLog);
        return saved;
    }

    /**
     * Retrieves a summary list of all users for admin viewing.
     *
     * @return List of maps containing user details (id, username, email, role, createdAt)
     */
    @Override
    public List<Map<String, Object>> getAllUsers() {
        // Build a summary DTO for each user for admin view
        List<User> users = userService.getAllUsers();
        List<Map<String, Object>> userDtos = new java.util.ArrayList<>();
        for (User user : users) {
            Map<String, Object> dto = new java.util.HashMap<>();
            dto.put("id", user.getId());
            dto.put("username", user.getUsername());
            dto.put("email", user.getEmail());
            dto.put("role", user.getRole());
            dto.put("createdAt", user.getCreatedAt());
            userDtos.add(dto);
        }
        return userDtos;
    }
}
