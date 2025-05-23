package com.jvp.KeyBastion_backend.repositories;

import com.jvp.KeyBastion_backend.model.Credential;
import com.jvp.KeyBastion_backend.model.User;
import com.jvp.KeyBastion_backend.model.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Repository interface for accessing and managing credential data in KeyBastion's secure storage.
 * <p>
 * This interface provides data access methods that enforce the security model of KeyBastion
 * by implementing user ownership constraints on all database operations. Methods in this
 * repository ensure that credentials can only be accessed by their rightful owners or users
 * with whom credentials have been explicitly shared.
 * </p>
 * <p>
 * Key security features implemented by this repository:
 * <ul>
 *   <li>User-scoped credential queries to prevent unauthorized access</li>
 *   <li>Support for the activity logging system through detailed query methods</li>
 *   <li>Integration with the category system for organizational security</li>
 *   <li>JPA's built-in protections against SQL injection and other data access vulnerabilities</li>
 * </ul>
 * </p>
 */
public interface CredentialRepository extends JpaRepository<Credential, UUID> {

    /**
     * Finds all credentials belonging to a specific user.
     *
     * @param user The user whose credentials to retrieve
     * @return List of Credential objects for the user
     */
    List<Credential> findByUser(User user);

    /**
     * Finds all credentials belonging to a specific user and category.
     *
     * @param user The user whose credentials to retrieve
     * @param category The category to filter by
     * @return List of Credential objects for the user and category
     */
    List<Credential> findByUserAndCategory(User user, Category category);

    /**
     * Finds a credential by its ID and verifies user ownership in a single operation.
     * <p>
     * This method is a critical security enforcement point that ensures users can only
     * access credentials they own. By combining the ID and user parameters in a single
     * query, it prevents unauthorized access to credentials even if a user somehow
     * obtains the UUID of another user's credential.
     * </p>
     * <p>
     * This method should be preferred over findById() when the user context is available,
     * as it provides an additional layer of access control directly at the database level.
     * </p>
     *
     * @param id The credential's UUID
     * @param user The owner of the credential
     * @return Optional containing the Credential if found and owned by the specified user, or empty if not
     */
    Optional<Credential> findByIdAndUser(UUID id, User user);

    /**
     * Finds all credentials with account names containing the specified string.
     *
     * @param accountName The substring to search for in account names
     * @return List of Credential objects with matching account names
     */
    List<Credential> findByAccountNameContaining(String accountName);

    /**
     * Finds all credentials created after a specific date for a given user.
     * <p>
     * This method supports the dashboard's "Recently Added" feature and security
     * monitoring capabilities. By filtering credentials by creation date, it allows
     * the system to identify and monitor recent credential activity, which is important
     * for detecting unusual patterns that might indicate security issues.
     * </p>
     * <p>
     * The method enforces user-level access control by requiring a user parameter,
     * ensuring that only credentials owned by the specified user are returned.
     * </p>
     *
     * @param date The date after which credentials were created
     * @param user The user whose credentials to retrieve
     * @return List of Credential objects created after the given date, owned by the specified user
     */
    @Query("SELECT c FROM Credential c WHERE c.createdAt > :date AND c.user = :user")
    List<Credential> findCredentialsCreatedAfter(@Param("date") LocalDateTime date, @Param("user") User user);
    
    /**
     * Counts the number of credentials in a specific category.
     *
     * @param category The category to count credentials for
     * @return The number of credentials in the category
     */
    long countByCategory(Category category);
    /**
     * Finds all credentials belonging to a specific category.
     *
     * @param category The category whose credentials to retrieve
     * @return List of Credential objects in the category
     */
    List<Credential> findByCategory(Category category);

}
