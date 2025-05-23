package com.jvp.KeyBastion_backend.controllers.admin;

import com.jvp.KeyBastion_backend.controllers.BaseController;
import com.jvp.KeyBastion_backend.dto.AdminDTO.CategoryStatsResponse;
import com.jvp.KeyBastion_backend.dto.AdminDTO.SharingStatsResponse;
import com.jvp.KeyBastion_backend.model.Role;
import com.jvp.KeyBastion_backend.model.User;
import com.jvp.KeyBastion_backend.services.ActivityLogService;
import com.jvp.KeyBastion_backend.services.CategoryService;
import com.jvp.KeyBastion_backend.services.CredentialService;
import com.jvp.KeyBastion_backend.services.SharingService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * AdminStatsController provides centralized endpoints for administrative statistics and metrics.
 * <p>
 * This controller is specifically designed for the admin dashboard and provides a unified interface
 * for retrieving various system-wide statistics at the URL paths expected by the frontend admin dashboard.
 * Key metrics included are:
 * </p>
 * <ul>
 *   <li>User-related statistics (active users, new registrations)</li>
 *   <li>Credential usage metrics (most used categories, security levels)</li>
 *   <li>Sharing patterns and statistics</li>
 *   <li>System health metrics</li>
 * </ul>
 * <p>
 * All endpoints are secured with Spring Security's @PreAuthorize annotation to ensure only users
 * with ADMIN role can access these administrative functions. The controller reuses existing service
 * classes to provide consistent data processing and business logic.
 * </p>
 */
@RestController
@RequestMapping("/api/admin/stats")
@PreAuthorize("hasRole('ADMIN')")
public class AdminStatsController extends BaseController {

    @Autowired
    private CategoryService categoryService;
    
    @Autowired
    private CredentialService credentialService;
    
    @Autowired
    private SharingService sharingService;
    
    @Autowired
    private ActivityLogService activityLogService;
    
    /**
     * Gets statistics about categories.
     * This endpoint matches the frontend's expected path.
     *
     * @return Category statistics
     */
    @GetMapping("/categories")
    public ResponseEntity<List<CategoryStatsResponse>> getCategoryStats() {
        User admin = getCurrentUser();
        
        if (admin.getRole() != Role.ADMIN) {
            return ResponseEntity.status(403).build();
        }

        List<com.jvp.KeyBastion_backend.model.Category> allCategories = categoryService.findCategoriesByNameContaining("");

        // Log activity
        activityLogService.createAndLogActivity(
            admin,
            "VIEW_CATEGORY_STATS",
            "Admin viewed category statistics",
            getClientIp()
        );

        // Group by category name and count credentials
        Map<String, Long> categoryCounts = new HashMap<>();

        for (com.jvp.KeyBastion_backend.model.Category category : allCategories) {
            String categoryName = category.getName();
            long credentialCount = credentialService.countCredentialsByCategory(category);
            categoryCounts.put(categoryName, categoryCounts.getOrDefault(categoryName, 0L) + credentialCount);
        }

        // Convert to response format
        List<CategoryStatsResponse> response = categoryCounts.entrySet().stream()
                .map(entry -> new CategoryStatsResponse(entry.getKey(), entry.getValue()))
                .collect(Collectors.toList());

        return ResponseEntity.ok(response);
    }
    
    /**
     * Gets statistics about shared credentials by category.
     * This endpoint matches the frontend's expected path.
     *
     * @return Sharing statistics by category
     */
    @GetMapping("/sharing")
    public ResponseEntity<List<SharingStatsResponse>> getSharingStats() {
        User admin = getCurrentUser();
        
        if (admin.getRole() != Role.ADMIN) {
            return ResponseEntity.status(403).build();
        }

        List<com.jvp.KeyBastion_backend.model.Sharing> allSharings = sharingService.findAllSharings();

        // Log activity
        activityLogService.createAndLogActivity(
            admin,
            "VIEW_SHARING_STATS",
            "Admin viewed sharing statistics",
            getClientIp()
        );

        // Group by category and count sharings
        Map<String, Long> categoryShareCounts = new HashMap<>();

        for (com.jvp.KeyBastion_backend.model.Sharing sharing : allSharings) {
            String categoryName = sharing.getCredential().getCategory() != null
                    ? sharing.getCredential().getCategory().getName()
                    : "Uncategorized";

            categoryShareCounts.put(
                    categoryName, categoryShareCounts.getOrDefault(categoryName, 0L) + 1);
        }

        // Convert to response format
        List<SharingStatsResponse> response = categoryShareCounts.entrySet().stream()
                .map(entry -> new SharingStatsResponse(entry.getKey(), entry.getValue()))
                .sorted((a, b) -> Long.compare(b.getShareCount(), a.getShareCount())) // Sort by count descending
                .collect(Collectors.toList());

        return ResponseEntity.ok(response);
    }
}
