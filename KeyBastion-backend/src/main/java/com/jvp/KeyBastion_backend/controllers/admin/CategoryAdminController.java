package com.jvp.KeyBastion_backend.controllers.admin;

import com.jvp.KeyBastion_backend.controllers.BaseController;
import com.jvp.KeyBastion_backend.dto.AdminDTO.CategoryStatsResponse;
import com.jvp.KeyBastion_backend.model.Category;
import com.jvp.KeyBastion_backend.model.Role;
import com.jvp.KeyBastion_backend.model.User;
import com.jvp.KeyBastion_backend.services.ActivityLogService;
import com.jvp.KeyBastion_backend.services.CategoryService;
import com.jvp.KeyBastion_backend.services.CredentialService;

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
 * Controller for admin category management operations.
 */
@RestController
@RequestMapping("/api/admin/categories")
@PreAuthorize("hasRole('ADMIN')")
public class CategoryAdminController extends BaseController {

    @Autowired
    private CategoryService categoryService;
    
    @Autowired
    private CredentialService credentialService;
    
    @Autowired
    private ActivityLogService activityLogService;
    
    /**
     * Gets all categories in the system (both global and user-specific).
     *
     * @return List of categories
     */
    @GetMapping
    public ResponseEntity<List<Category>> getAllCategories() {
        User admin = getCurrentUser();
        
        if (admin.getRole() != Role.ADMIN) {
            return ResponseEntity.status(403).build();
        }

        // Get all categories
        List<Category> allCategories = categoryService.findAllCategories();

        // Log activity
        activityLogService.createAndLogActivity(
            admin,
            "VIEW_ALL_CATEGORIES",
            "Admin viewed all categories",
            getClientIp()
        );

        return ResponseEntity.ok(allCategories);
    }

    /**
     * Creates a new global category that is available to all users.
     *
     * @param category The category to create
     * @return The created category
     */
    @PostMapping
    public ResponseEntity<Category> createGlobalCategory(@RequestBody Category category) {
        User admin = getCurrentUser();
        
        if (admin.getRole() != Role.ADMIN) {
            return ResponseEntity.status(403).build();
        }

        // Set the admin as the owner but mark it as global
        category.setUser(admin);
        category.setGlobal(true);

        Category savedCategory = categoryService.saveCategory(category);

        // Log activity
        activityLogService.createAndLogActivity(
            admin,
            "CREATE_GLOBAL_CATEGORY",
            "Created global category: " + savedCategory.getName(),
            getClientIp()
        );

        return ResponseEntity.ok(savedCategory);
    }
    
    /**
     * Gets statistics about categories.
     *
     * @return Category statistics
     */
    @GetMapping("/stats")
    public ResponseEntity<List<CategoryStatsResponse>> getCategoryStats() {
        User admin = getCurrentUser();
        
        if (admin.getRole() != Role.ADMIN) {
            return ResponseEntity.status(403).build();
        }

        List<Category> allCategories = categoryService.findCategoriesByNameContaining("");

        // Log activity
        activityLogService.createAndLogActivity(
            admin,
            "VIEW_CATEGORY_STATS",
            "Admin viewed category statistics",
            getClientIp()
        );

        // Group by category name and count credentials
        Map<String, Long> categoryCounts = new HashMap<>();

        for (Category category : allCategories) {
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
}
