package com.jvp.KeyBastion_backend.services;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import com.jvp.KeyBastion_backend.model.ActivityLog;
import com.jvp.KeyBastion_backend.model.User;
import com.jvp.KeyBastion_backend.repositories.ActivityLogRepository;

/**
 * Implementation of ActivityLogService for KeyBastion.
 * <p>
 * Handles saving and retrieving user activity logs for auditing and monitoring.
 * Uses ActivityLogRepository for database operations.
 */
@Service
public class ActivityLogServiceImpl implements ActivityLogService {

    @Autowired
    private ActivityLogRepository activityLogRepository;

    /**
     * Saves a new activity log entry to the database.
     *
     * @param activityLog The log entry to save
     * @return The saved ActivityLog object
     */
    @Override
    public ActivityLog logActivity(ActivityLog activityLog) {
        // Save the provided activity log entry to the database
        return activityLogRepository.save(activityLog);
    }
    
    /**
     * Convenience method to create and log an activity in one step.
     *
     * @param user The user performing the action
     * @param action The action being performed (e.g., "CREATE", "UPDATE", "DELETE")
     * @param description Description of the activity
     * @param ipAddress IP address of the user
     * @return The saved activity log
     */
    @Override
    public ActivityLog createAndLogActivity(User user, String action, String description, String ipAddress) {
        ActivityLog log = new ActivityLog();
        log.setUser(user);
        log.setAction(action);
        log.setDescription(description);
        log.setTimestamp(LocalDateTime.now());
        log.setIpAddress(ipAddress);
        return logActivity(log);
    }

    /**
     * Retrieves the most recent activity logs for a specific user, limited by
     * count.
     *
     * @param user  The user whose logs to retrieve
     * @param limit Maximum number of logs to return
     * @return List of ActivityLog entries for the user
     */

    @Override
    public List<ActivityLog> findActivityLogsByUser(User user, int limit) {
        // Retrieve the most recent activity logs for the given user, limited by count
        UUID userId = user.getId();
        Pageable pageable = PageRequest.of(0, limit);
        List<ActivityLog> logs = activityLogRepository.findTopNByUserIdOrderByTimestampDesc(userId, pageable);
        System.out.println("Retrieved " + logs.size() + " logs for user ID: " + userId);
        return logs;
    }

    /**
     * Retrieves all activity logs for a specific user (no limit).
     *
     * @param user The user whose activity logs to retrieve
     * @return List of ActivityLog entries for the user
     */
    @Override
    public List<ActivityLog> findActivityLogsByUser(User user) {
        return activityLogRepository.findByUser(user);
    }

    /**
     * Retrieves all activity logs in the system.
     *
     * @return List of all ActivityLog entries
     */
    @Override
    public List<ActivityLog> findAllActivityLogs() {
        // Retrieve all activity logs in the system (for admin/audit purposes)
        return activityLogRepository.findAll();
    }

    /**
     * Retrieves all activity logs for a specific action type.
     *
     * @param action The action type to filter by (e.g., CREATE, UPDATE, DELETE)
     * @return List of ActivityLog entries matching the action
     */
    @Override
    public List<ActivityLog> findActivityLogsByAction(String action) {
        // Retrieve all activity logs matching the specified action type
        return activityLogRepository.findByAction(action);
    }

    /**
     * Retrieves activity logs for a user within a specific date range.
     *
     * @param startDate Start of the date range
     * @param endDate   End of the date range
     * @param user      The user whose logs to retrieve
     * @return List of ActivityLog entries matching the criteria
     */
    @Override
    public List<ActivityLog> findActivityLogsBetweenDates(LocalDateTime startDate, LocalDateTime endDate, User user) {
        // Retrieve activity logs for the user within the specified date range
        return activityLogRepository.findActivityLogsBetweenDates(startDate, endDate, user);
    }
}
