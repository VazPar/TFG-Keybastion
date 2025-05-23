package com.jvp.KeyBastion_backend.controllers;

import com.jvp.KeyBastion_backend.model.ActivityLog;
import com.jvp.KeyBastion_backend.model.User;
import com.jvp.KeyBastion_backend.services.ActivityLogService;
import com.jvp.KeyBastion_backend.services.UserService;
import java.time.Duration;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/activity-logs")
public class ActivityLogController {

    @Autowired
    private ActivityLogService activityLogService;

    @Autowired
    private UserService userService;

    // Get current authenticated user
    protected User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        return userService
                .findUserByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    /**
     * Get recent activity logs for the current user
     *
     * @param limit Maximum number of logs to return (default: 5)
     * @return List of recent activity logs
     */
    @GetMapping("/recent")
    public ResponseEntity<List<Map<String, Object>>> getRecentActivityLogs(
            @RequestParam(defaultValue = "5") int limit) {

        User currentUser = getCurrentUser();
        System.out.println("Current User ID: " + currentUser.getId());
        System.out.println("Limit Value: " + limit);

        // Get user's activity logs
        List<ActivityLog> activityLogs = activityLogService.findActivityLogsByUser(currentUser, limit);
        System.out.println("Number of Activity Logs found: " + activityLogs.size());

        // Sort by timestamp (newest first) and limit the results
        List<Map<String, Object>> result = activityLogs.stream()
                .map(
                        log -> {
                            Map<String, Object> logDto = new HashMap<>();
                            logDto.put("action", log.getAction());

                            // Calculate timeAgo using ZonedDateTime for timezone handling
                            LocalDateTime logTimestamp = log.getTimestamp();
                            ZoneId userZoneId = ZoneId.systemDefault(); // Or get from user profile if stored
                            ZonedDateTime logZonedDateTime = logTimestamp.atZone(userZoneId);
                            ZonedDateTime nowZonedDateTime = ZonedDateTime.now(userZoneId);
                            Duration duration = Duration.between(logZonedDateTime, nowZonedDateTime);

                            String timeAgo = getTimeAgo(duration);
                            logDto.put("timeAgo", timeAgo);

                            logDto.put("details", log.getDescription());
                            logDto.put("icon", "KeyIcon"); // Hardcoded for now
                            return logDto;
                        })
                .collect(Collectors.toList());

        return ResponseEntity.ok(result);
    }

    /**
     * Get all activity logs for the current user
     *
     * @return List of all activity logs
     */
    @GetMapping("/all")
    public ResponseEntity<List<Map<String, Object>>> getAllActivityLogsForUser() {
        User currentUser = getCurrentUser();
        List<ActivityLog> activityLogs = activityLogService.findActivityLogsByUser(currentUser);

        List<Map<String, Object>> result = activityLogs.stream()
                .map(log -> {
                    Map<String, Object> logDto = new HashMap<>();
                    logDto.put("action", log.getAction());
                    logDto.put("description", log.getDescription());
                    logDto.put("timestamp", log.getTimestamp());
                    logDto.put("ipAddress", log.getIpAddress());
                    return logDto;
                })
                .collect(Collectors.toList());

        return ResponseEntity.ok(result);
    }

    // Helper function to calculate timeAgo string
    private String getTimeAgo(Duration duration) {
        long seconds = duration.getSeconds();
        long minutes = duration.toMinutes();
        long hours = duration.toHours();
        long days = duration.toDays();

        if (days > 0) {
            if (days == 1) {
                return "Yesterday";
            } else {
                return days + " days ago";
            }
        } else if (hours > 0) {
            return hours + " hours ago";
        } else if (minutes > 0) {
            return minutes + " minutes ago";
        } else {
            return seconds + " seconds ago";
        }
    }
}
