package com.jvp.KeyBastion_backend.services;

import com.jvp.KeyBastion_backend.dto.AdminDTO.AdminUserCreationRequest;
import com.jvp.KeyBastion_backend.dto.AdminDTO.CategoryStatsResponse;
import com.jvp.KeyBastion_backend.dto.AdminDTO.SharingStatsResponse;
import com.jvp.KeyBastion_backend.model.ActivityLog;
import com.jvp.KeyBastion_backend.model.Category;
import com.jvp.KeyBastion_backend.model.User;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * AdminService defines administrative operations for the KeyBastion application.
 * <p>
 * This service provides methods for managing admin users, viewing activity logs,
 * gathering statistics, and managing global categories. All methods are intended
 * for use by admin users only.
 */
public interface AdminService {
    /**
     * Creates a new admin user in the system.
     *
     * @param request   Details for the new admin user (username, password, etc.)
     * @param ipAddress IP address from which the request was made
     * @return The created admin User object
     */
    User createAdminUser(AdminUserCreationRequest request, String ipAddress);

    /**
     * Retrieves activity logs filtered by action type and date range.
     *
     * @param action    The type of action to filter (e.g., CREATE, UPDATE, DELETE)
     * @param startDate Start of the date range
     * @param endDate   End of the date range
     * @return List of matching ActivityLog entries
     */
    List<ActivityLog> getAllActivityLogs(String action, LocalDateTime startDate, LocalDateTime endDate);

    /**
     * Retrieves all activity logs for a specific user.
     *
     * @param userId The ID of the user
     * @return List of ActivityLog entries for the user
     */
    List<ActivityLog> getUserActivityLogs(UUID userId);

    /**
     * Gets statistics about category usage across all users.
     *
     * @return List of category statistics
     */
    List<CategoryStatsResponse> getCategoryStats();

    /**
     * Gets statistics about credential sharing across the platform.
     *
     * @return List of sharing statistics
     */
    List<SharingStatsResponse> getSharingStats();

    /**
     * Retrieves all global categories available in the system.
     *
     * @return List of global Category objects
     */
    List<Category> getAllCategories();

    /**
     * Creates a new global category that is available to all users.
     *
     * @param category  The category to create
     * @param admin     The admin performing the action
     * @param ipAddress IP address from which the request was made
     * @return The created Category object
     */
    Category createGlobalCategory(Category category, User admin, String ipAddress);

    /**
     * Retrieves a list of all users in the system (for admin view).
     *
     * @return List of user details as key-value maps
     */
    List<Map<String, Object>> getAllUsers();
}

