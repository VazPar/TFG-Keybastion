package com.jvp.KeyBastion_backend.controllers.admin;

import com.jvp.KeyBastion_backend.controllers.BaseController;
import com.jvp.KeyBastion_backend.dto.AdminDTO.SharingStatsResponse;
import com.jvp.KeyBastion_backend.model.Role;
import com.jvp.KeyBastion_backend.model.Sharing;
import com.jvp.KeyBastion_backend.model.User;
import com.jvp.KeyBastion_backend.services.ActivityLogService;
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
 * Controller for admin sharing operations.
 */
@RestController
@RequestMapping("/api/admin/sharing")
@PreAuthorize("hasRole('ADMIN')")
public class SharingAdminController extends BaseController {

    @Autowired
    private SharingService sharingService;
    
    @Autowired
    private ActivityLogService activityLogService;
    
    /**
     * Gets statistics about shared credentials by category.
     *
     * @return Sharing statistics by category
     */
    @GetMapping("/stats")
    public ResponseEntity<List<SharingStatsResponse>> getSharingStats() {
        User admin = getCurrentUser();
        
        if (admin.getRole() != Role.ADMIN) {
            return ResponseEntity.status(403).build();
        }

        List<Sharing> allSharings = sharingService.findAllSharings();

        // Log activity
        activityLogService.createAndLogActivity(
            admin,
            "VIEW_SHARING_STATS",
            "Admin viewed sharing statistics",
            getClientIp()
        );

        // Group by category and count sharings
        Map<String, Long> categoryShareCounts = new HashMap<>();

        for (Sharing sharing : allSharings) {
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
