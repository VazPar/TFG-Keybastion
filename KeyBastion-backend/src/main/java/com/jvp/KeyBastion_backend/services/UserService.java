package com.jvp.KeyBastion_backend.services;

import com.jvp.KeyBastion_backend.model.Role;
import com.jvp.KeyBastion_backend.model.User;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * UserService defines operations for managing users and authentication in KeyBastion.
 * <p>
 * This interface is a critical security component that manages the user identity lifecycle
 * including registration, authentication, profile management, and role-based access control.
 * It enforces security policies related to user accounts and provides the foundation for
 * KeyBastion's authentication and authorization system.
 * </p>
 * <p>
 * Security responsibilities include:
 * <ul>
 *   <li>Secure user registration with appropriate validation</li>
 *   <li>Password hashing and secure credential storage</li>
 *   <li>User identity verification and lookup</li>
 *   <li>Role-based access control enforcement</li>
 *   <li>Account management including updates and deletion</li>
 * </ul>
 * </p>
 */
public interface UserService {

    /**
     * Registers a new user in the system with secure credential handling.
     * <p>
     * This method securely registers a new user in KeyBastion by properly hashing the
     * password and validating user information. It is the primary entry point for
     * user creation and enforces security policies during the registration process.
     * </p>
     * <p>
     * Security measures implemented:
     * <ul>
     *   <li>Password hashing using BCrypt before storage</li>
     *   <li>Username and email uniqueness enforcement</li>
     *   <li>Default role assignment for principle of least privilege</li>
     *   <li>Creation timestamp for audit trails</li>
     * </ul>
     * </p>
     *
     * @param user The User object to register (username, email, password, etc.)
     * @return The registered User object with sensitive fields protected
     * @throws RuntimeException if registration fails due to duplicate username/email
     */
    User registerUser(User user);

    /**
     * Finds a user by their unique ID for identification and authentication.
     * <p>
     * This method securely retrieves a user by their UUID, which is a common operation
     * during authentication flows and user profile access. It uses Spring Data's
     * built-in protections against SQL injection.
     * </p>
     * <p>
     * Security usage context:
     * <ul>
     *   <li>Used during authentication to verify user identity</li>
     *   <li>Used when accessing user profiles to enforce ownership</li>
     *   <li>Used for administrative user management with appropriate authorization</li>
     * </ul>
     * </p>
     *
     * @param id UUID of the user to retrieve
     * @return Optional containing the User if found, or empty if not
     */
    Optional<User> findUserById(UUID id);

    /**
     * Finds a user by their email address.
     *
     * @param email The user's email
     * @return Optional containing the User if found, or empty if not
     */
    Optional<User> findUserByEmail(String email);

    /**
     * Finds a user by their username.
     *
     * @param username The user's username
     * @return Optional containing the User if found, or empty if not
     */
    Optional<User> findUserByUsername(String username);

    /**
     * Checks if a user exists with the given email address.
     *
     * @param email The email to check
     * @return true if a user exists with the email, false otherwise
     */
    boolean existsByEmail(String email);

    /**
     * Checks if a user exists with the given username.
     *
     * @param username The username to check
     * @return true if a user exists with the username, false otherwise
     */
    boolean existsByUsername(String username);

    /**
     * Updates an existing user's information with security checks.
     * <p>
     * This method securely updates a user's profile information while maintaining
     * security properties. It is used for profile management, credential updates,
     * and administrative user management.
     * </p>
     * <p>
     * Security considerations:
     * <ul>
     *   <li>Password changes should be properly hashed before storage</li>
     *   <li>Role changes should be restricted to administrative users</li>
     *   <li>Email changes may require verification workflows</li>
     *   <li>Implementation should validate the caller has appropriate permissions</li>
     *   <li>Updates should be logged for security audit purposes</li>
     * </ul>
     * </p>
     *
     * @param user The User object with updated information
     * @return The updated User object with sensitive fields protected
     */
    User updateUser(User user);

    /**
     * Deletes a user by their unique ID with proper security cleanup.
     * <p>
     * This method securely removes a user from the system, including appropriate
     * cleanup of associated data. This is a high-risk operation that should be
     * carefully controlled and audited.
     * </p>
     * <p>
     * Security requirements:
     * <ul>
     *   <li>Should only be executable by the user themselves or administrators</li>
     *   <li>Must handle associated credentials and shared data appropriately</li>
     *   <li>Should create audit logs for compliance and security tracking</li>
     *   <li>Should implement appropriate confirmation mechanisms</li>
     *   <li>Should consider soft deletion or anonymization for compliance</li>
     * </ul>
     * </p>
     *
     * @param id UUID of the user to delete
     */
    void deleteUserById(UUID id);

    /**
     * Retrieves all users in the system - a restricted administrative operation.
     * <p>
     * This method provides a complete list of all users in the system and should be
     * restricted to administrative access only. It exposes sensitive user information
     * and should be used with appropriate authorization checks.
     * </p>
     * <p>
     * Security restrictions:
     * <ul>
     *   <li>Must be restricted to users with ADMIN role only</li>
     *   <li>Should only return necessary user information (not passwords)</li>
     *   <li>May need pagination for large user bases to prevent DoS concerns</li>
     *   <li>Access should be logged for security audit purposes</li>
     * </ul>
     * </p>
     *
     * @return List of all User objects with sensitive data protected
     */
    List<User> getAllUsers();

    /**
     * Retrieves all users with a specific role - an administrative security operation.
     * <p>
     * This method supports role-based access control (RBAC) administration by retrieving
     * all users with a particular security role. It enables administrative oversight
     * of role assignments and security privilege distribution.
     * </p>
     * <p>
     * Security context:
     * <ul>
     *   <li>Critical for security auditing of privilege distribution</li>
     *   <li>Access should be restricted to administrative users</li>
     *   <li>Should be logged for security compliance purposes</li>
     *   <li>Useful for detecting unusual role assignments or privilege creep</li>
     * </ul>
     * </p>
     *
     * @param role The user role to filter by (e.g., ADMIN, USER)
     * @return List of User objects with the given role, with sensitive data protected
     */
    List<User> getUsersByRole(Role role);
}

