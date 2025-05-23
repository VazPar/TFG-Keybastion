package com.jvp.KeyBastion_backend.controllers.admin;

import com.jvp.KeyBastion_backend.controllers.BaseController;
import com.jvp.KeyBastion_backend.model.ActivityLog;
import com.jvp.KeyBastion_backend.model.Role;
import com.jvp.KeyBastion_backend.model.User;
import com.jvp.KeyBastion_backend.services.ActivityLogService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Controller for admin activity log operations.
 */
@RestController
@RequestMapping("/api/admin/logs")
@PreAuthorize("hasRole('ADMIN')")
public class ActivityLogAdminController extends BaseController {

    @Autowired
    private ActivityLogService activityLogService;
    
    private static final int DEFAULT_LOG_LIMIT = 20;
    
    /**
     * Gets all activity logs, with optional filtering by action, start date, and end date.
     *
     * @param action The action to filter by (optional)
     * @param startDate The start date to filter by (optional)
     * @param endDate The end date to filter by (optional)
     * @return List of activity logs
     */
    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getAllActivityLogs(
            @RequestParam(required = false) String action,
            @RequestParam(required = false) LocalDateTime startDate,
            @RequestParam(required = false) LocalDateTime endDate) {

        // Ensure current user is admin
        User admin = getCurrentUser();
        
        if (admin.getRole() != Role.ADMIN) {
            return ResponseEntity.status(403).body(List.of(Map.of("error", "Unauthorized access")));
        }

        List<ActivityLog> logs;

        if (action != null && !action.isEmpty()) {
            logs = activityLogService.findActivityLogsByAction(action);
        } else if (startDate != null && endDate != null) {
            logs = activityLogService.findActivityLogsBetweenDates(startDate, endDate, null);
        } else if (startDate != null) {
            logs = activityLogService.findAllActivityLogs().stream()
                    .filter(log -> !log.getTimestamp().isBefore(startDate))
                    .collect(Collectors.toList());
        } else if (endDate != null) {
            logs = activityLogService.findAllActivityLogs().stream()
                    .filter(log -> !log.getTimestamp().isAfter(endDate))
                    .collect(Collectors.toList());
        } else {
            logs = activityLogService.findAllActivityLogs();
        }

        // Convert to DTO with only necessary information
        List<Map<String, Object>> logDtos = logs.stream()
        .sorted((a, b) -> b.getTimestamp().compareTo(a.getTimestamp()))
        .map(log -> {
            Map<String, Object> dto = new HashMap<>();
            dto.put("id", log.getId());
            dto.put("userId", log.getUser().getId());
            dto.put("action", log.getAction());
            dto.put("details", log.getDescription());
            dto.put("timestamp", log.getTimestamp());
            dto.put("ipAddress", log.getIpAddress());
            return dto;
        })
        .collect(Collectors.toList());

        return ResponseEntity.ok(logDtos);
    }

    /**
     * Gets activity logs for a specific user.
     *
     * @param userId The ID of the user
     * @return List of activity logs for the user
     */
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Map<String, Object>>> getUserActivityLogs(@PathVariable UUID userId) {
        User admin = getCurrentUser();
        
        if (admin.getRole() != Role.ADMIN) {
            return ResponseEntity.status(403).body(List.of(Map.of("error", "Unauthorized access")));
        }

        User user = userService
                .findUserById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<ActivityLog> logs = activityLogService.findActivityLogsByUser(user, DEFAULT_LOG_LIMIT);

        // Convert to DTO with only necessary information
        List<Map<String, Object>> logDtos = logs.stream()
        .sorted((a, b) -> b.getTimestamp().compareTo(a.getTimestamp()))
        .map(log -> {
            Map<String, Object> dto = new HashMap<>();
            dto.put("id", log.getId());
            dto.put("userId", log.getUser().getId());
            dto.put("action", log.getAction());
            dto.put("details", log.getDescription());
            dto.put("timestamp", log.getTimestamp());
            dto.put("ipAddress", log.getIpAddress());
            return dto;
        })
        .collect(Collectors.toList());

        // Log activity
        activityLogService.createAndLogActivity(
            admin,
            "VIEW_USER_LOGS",
            "Admin viewed activity logs for user: " + user.getUsername(),
            getClientIp()
        );

        return ResponseEntity.ok(logDtos);
    }
}
