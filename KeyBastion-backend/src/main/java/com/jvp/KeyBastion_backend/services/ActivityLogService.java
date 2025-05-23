package com.jvp.KeyBastion_backend.services;

import com.jvp.KeyBastion_backend.model.ActivityLog;
import com.jvp.KeyBastion_backend.model.User;
import java.time.LocalDateTime;
import java.util.List;

/**
 * ActivityLogService defines operations for recording and retrieving user activity logs.
 * <p>
 * The activity logging system is a critical security feature of KeyBastion that provides comprehensive
 * audit trails for all important user actions. Each log entry records the user, action type, timestamp,
 * detailed description, and originating IP address. This enables:
 * <ul>
 *   <li>Security auditing and compliance reporting</li>
 *   <li>Intrusion and suspicious activity detection</li>
 *   <li>User accountability and action tracking</li>
 *   <li>Historical analysis of system usage</li>
 * </ul>
 * </p>
 * <p>
 * Key action types tracked include "CREATE", "UPDATE", and "DELETE" operations on credentials,
 * as well as credential sharing events and administrative actions.
 * </p>
 */
public interface ActivityLogService {

    /**
     * Saves a new activity log entry to the database.
     *
     * @param activityLog The activity log entry to save
     * @return The saved ActivityLog object
     */
    ActivityLog logActivity(ActivityLog activityLog);

    /**
     * Convenience method to create and log an activity in one step.
     * <p>
     * This is the primary method used throughout the application for logging user activities.
     * It handles the creation of a properly structured ActivityLog entity with all necessary
     * attributes and saves it to the database in a single operation. This method is essential
     * for the credential deletion workflow and other security-critical operations.
     * </p>
     *
     * @param user The user performing the action
     * @param action The action being performed (e.g., "CREATE", "UPDATE", "DELETE")
     * @param description Description of the activity, should be detailed enough for audit purposes
     * @param ipAddress IP address of the user for security tracking
     * @return The saved ActivityLog object with generated ID and timestamp
     */
    ActivityLog createAndLogActivity(User user, String action, String description, String ipAddress);

    /**
     * Retrieves recent activity logs for a specific user, limited by count.
     * <p>
     * This method supports the security dashboard by providing recent user activities
     * for monitoring. It enables the detection of unusual patterns or potentially
     * unauthorized activities by showing the most recent actions taken by a user.
     * </p>
     * <p>
     * Security considerations:
     * <ul>
     *   <li>Access to these logs should be restricted based on user privileges</li>
     *   <li>Regular users should only see their own logs</li>
     *   <li>Admins may have access to all users' logs for security monitoring</li>
     *   <li>The limit parameter prevents excessive data exposure</li>
     * </ul>
     * </p>
     *
     * @param user  The user whose activity logs to retrieve
     * @param limit The maximum number of logs to return (security and performance control)
     * @return List of ActivityLog entries for the user, ordered by timestamp descending
     */
    List<ActivityLog> findActivityLogsByUser(User user, int limit);

    /**
     * Retrieves all activity logs for a specific user without limit.
     * <p>
     * This method provides complete audit capabilities for a user's actions throughout
     * their account history. It is used primarily for comprehensive security audits,
     * compliance reporting, and investigating security incidents related to a specific user.
     * </p>
     * <p>
     * Security usage notes:
     * <ul>
     *   <li>This method should be used with caution due to potential data volume</li>
     *   <li>Access should be restricted to the user themselves or administrators</li>
     *   <li>Results may need pagination in the UI to avoid overwhelming data display</li>
     *   <li>Sensitive log details should be appropriately sanitized in the presentation layer</li>
     * </ul>
     * </p>
     *
     * @param user The user whose activity logs to retrieve
     * @return Complete list of ActivityLog entries for the user, ordered by timestamp
     */
    List<ActivityLog> findActivityLogsByUser(User user);

    /**
     * Retrieves all activity logs across the entire system.
     * <p>
     * This method provides complete system-wide visibility into all user actions and
     * is a critical capability for security administrators. It supports comprehensive
     * security monitoring, threat detection, and forensic analysis across the entire
     * application.
     * </p>
     * <p>
     * Security restrictions:
     * <ul>
     *   <li>This method should ONLY be accessible to users with ADMIN role</li>
     *   <li>The results contain sensitive information and should be transmitted securely</li>
     *   <li>In production environments, consider implementing pagination or time-based
     *       filtering to manage large result sets</li>
     *   <li>This data may contain personally identifiable information subject to
     *       privacy regulations</li>
     * </ul>
     * </p>
     *
     * @return List of all ActivityLog entries in the system
     */
    List<ActivityLog> findAllActivityLogs();

    /**
     * Retrieves all activity logs for a specific action type.
     * <p>
     * This method enables focused security analysis by filtering logs by action type.
     * It is particularly valuable for security monitoring and threat detection by
     * identifying patterns in specific high-risk actions, such as credential deletions
     * or password changes.
     * </p>
     * <p>
     * Security applications:
     * <ul>
     *   <li>Monitoring for unusual frequency of sensitive operations</li>
     *   <li>Detecting potential data exfiltration through mass deletions</li>
     *   <li>Tracking credential sharing behavior across the system</li>
     *   <li>Identifying users with anomalous behavior patterns for specific actions</li>
     * </ul>
     * </p>
     *
     * @param action The action type to filter by (e.g., CREATE, UPDATE, DELETE, SHARE, REVOKE)
     * @return List of ActivityLog entries matching the action
     */
    List<ActivityLog> findActivityLogsByAction(String action);

    /**
     * Retrieves activity logs within a specific date range for a user.
     * <p>
     * This method supports targeted security investigations and audits by allowing
     * time-based filtering of user activities. It is valuable for investigating security
     * incidents that occurred during a known timeframe or for generating compliance
     * reports covering specific periods.
     * </p>
     * <p>
     * Security and audit applications:
     * <ul>
     *   <li>Investigating suspicious activity during specific time windows</li>
     *   <li>Correlating user actions with reported security incidents</li>
     *   <li>Generating time-bounded compliance and audit reports</li>
     *   <li>Tracking user behavior changes over specific periods</li>
     * </ul>
     * </p>
     *
     * @param startDate Start of the date range (inclusive)
     * @param endDate   End of the date range (inclusive)
     * @param user      The user whose activity logs to retrieve
     * @return List of ActivityLog entries matching the date range criteria
     */
    List<ActivityLog> findActivityLogsBetweenDates(
            LocalDateTime startDate, LocalDateTime endDate, User user);
}
