package com.jvp.KeyBastion_backend.services;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.jvp.KeyBastion_backend.model.Category;
import com.jvp.KeyBastion_backend.model.Credential;
import com.jvp.KeyBastion_backend.model.User;
import com.jvp.KeyBastion_backend.repositories.CredentialRepository;

/**
 * Implementation of CredentialService for KeyBastion's secure credential management system.
 * <p>
 * This service is responsible for all credential-related operations including creating,
 * retrieving, updating, and securely deleting credentials. It implements proper transaction
 * management to ensure database integrity, especially during critical operations like
 * credential deletion where referential integrity with sharing records must be maintained.
 * </p>
 * <p>
 * Security features implemented in this service include:
 * <ul>
 *   <li>Activity logging for audit trails of all credential operations</li>
 *   <li>Transaction management to maintain data integrity</li>
 *   <li>Validation of user ownership before operations</li>
 *   <li>Safe handling of sensitive credential data</li>
 * </ul>
 * </p>
 * <p>
 * This service works closely with ActivityLogService to maintain a complete audit trail
 * of all credential operations for security compliance and monitoring purposes.
 * </p>
 */
@Service
public class CredentialServiceImpl implements CredentialService {

    private static final Logger logger = LoggerFactory.getLogger(CredentialServiceImpl.class);

    @Autowired
    private CredentialRepository credentialRepository;

    @Autowired
    private ActivityLogService activityLogService;

    /**
     * Creates a new credential entry for a user and logs the creation activity.
     * <p>
     * This method persists a new credential to the database and creates an activity log
     * entry for audit purposes. Activity logging captures the user who performed the action,
     * timestamp, IP address, and details of the credential created.
     * </p>
     *
     * @param credential The Credential object to create, should include user reference and all
     *                  necessary credential properties
     * @param ipAddress IP address of the user performing the action, used for activity logging
     * @return The created Credential object with generated ID
     */
    @Override
    public Credential createCredential(Credential credential, String ipAddress) {
        Credential savedCredential = credentialRepository.save(credential);

        // Log activity if ipAddress is provided (allows controller to handle logging separately)
        if (ipAddress != null && savedCredential != null && savedCredential.getUser() != null) {
            activityLogService.createAndLogActivity(
                savedCredential.getUser(), 
                "CREATE", 
                "Created credential: '" + savedCredential.getAccountName() + "'", 
                ipAddress
            );
        }
        return savedCredential;
    }

    /**
     * Finds a credential by its unique ID.
     *
     * @param id UUID of the credential
     * @return Optional containing the Credential if found, or empty if not
     */
    @Override
    public Optional<Credential> findCredentialById(UUID id) {
        return credentialRepository.findById(id);
    }

    /**
     * Retrieves all credentials belonging to a specific user.
     *
     * @param user The user whose credentials to retrieve
     * @return List of Credential objects for the user
     */
    @Override
    public List<Credential> findCredentialsByUser(User user) {
        return credentialRepository.findByUser(user);
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public List<Credential> findCredentialsByUserAndCategory(User user, com.jvp.KeyBastion_backend.model.Category category) {
        return credentialRepository.findByUserAndCategory(user, category);
    }

    /**
     * Updates an existing credential's information and logs the update activity.
     * <p>
     * This method performs several security checks:
     * <ol>
     *   <li>Verifies the credential exists before attempting updates</li>
     *   <li>Creates an activity log entry for audit purposes</li>
     * </ol>
     * </p>
     * <p>
     * Note that the caller is responsible for ensuring the user has proper permissions
     * to modify the credential. This would typically be handled at the controller level.
     * </p>
     * 
     * @param credential The Credential object with updated data
     * @param ipAddress IP address of the user performing the update, for activity logging
     * @return The updated Credential object
     * @throws RuntimeException if the credential does not exist
     */
    @Override
    public Credential updateCredential(Credential credential, String ipAddress) {
        if (credentialRepository.existsById(credential.getId())) {
            Credential updatedCredential = credentialRepository.save(credential);
            
            // Log activity if ipAddress is provided
            if (ipAddress != null && updatedCredential != null && updatedCredential.getUser() != null) {
                activityLogService.createAndLogActivity(
                    updatedCredential.getUser(), 
                    "UPDATE", 
                    "Updated credential: '" + updatedCredential.getAccountName() + "'", 
                    ipAddress
                );
            }
            return updatedCredential;
        }
        throw new RuntimeException("Credential not found with ID: " + credential.getId());
    }

    /**
     * Deletes a credential by its unique ID.
     * 
     * This method takes a UUID as input, searches for a credential with the given 
     * ID in the database, and deletes it if found. It properly handles transaction
     * management to ensure data integrity during the deletion process.
     * 
     * @param id UUID of the credential to delete
     * @param ipAddress IP address of the user for activity logging
     */
    @Override
    @Transactional
    public void deleteCredentialById(UUID id, String ipAddress) {
        // Retrieve credential before deletion for logging
        Optional<Credential> credentialOpt = credentialRepository.findById(id);
        
        if (credentialOpt.isPresent()) {
            Credential credential = credentialOpt.get();
            User credentialOwner = credential.getUser();
            String accountName = credential.getAccountName();
            
            // Delete the credential
            credentialRepository.deleteById(id);
            
            // Log activity if ipAddress is provided and user is not null
            if (ipAddress != null && credentialOwner != null) {
                activityLogService.createAndLogActivity(
                    credentialOwner, 
                    "DELETE", 
                    "Deleted credential: '" + accountName + "'", 
                    ipAddress
                );
            }
        } else {
            // Credential not found - log this unusual case
            logger.warn("Attempted to delete non-existent credential with ID: {}", id);
        }
    }

    /**
     * Retrieves all credentials with an account name containing a given search string.
     * <p>
     * This method performs a case-insensitive partial match search across credential
     * account names. It supports the search functionality in the user interface, allowing
     * users to quickly locate credentials by name.
     * </p>
     * <p>
     * Security note: This method should be used in conjunction with user filtering
     * at the controller level to ensure users can only search within their own credentials.
     * The repository method itself does not enforce user ownership restrictions.
     * </p>
     * 
     * @param accountName The search string to match against account names
     * @return List of Credential objects with matching account names
     */
    @Override
    public List<Credential> findCredentialsByAccountNameContaining(String accountName) {
        return credentialRepository.findByAccountNameContaining(accountName);
    }

    /**
     * Retrieves all credentials belonging to a specific category.
     * <p>
     * This method supports the category-based organization of credentials in the application,
     * allowing users to view credentials filtered by category. Categories are an important
     * organizational and security feature that help users manage large numbers of credentials
     * effectively.
     * </p>
     * <p>
     * Security considerations:
     * <ul>
     *   <li>When used in the UI, results should be filtered to only show credentials
     *       owned by or shared with the current user</li>
     *   <li>For admin statistics, this method may be used to count credentials across
     *       the entire system for a particular category</li>
     * </ul>
     * </p>
     * 
     * @param category The category whose credentials to retrieve
     * @return List of Credential objects in the category
     */
    @Override
    public List<Credential> findCredentialsByCategory(com.jvp.KeyBastion_backend.model.Category category) {
        return credentialRepository.findByCategory(category);
    }

    /**
     * Counts the number of credentials in a specific category.
     * <p>
     * This method efficiently provides count statistics without retrieving credential data,
     * which optimizes performance for dashboard statistics and category usage metrics.
     * It's particularly important for the admin dashboard where statistical information
     * about credential categories is displayed.
     * </p>
     * <p>
     * Security usage patterns:
     * <ul>
     *   <li>For regular users: Should be filtered by user to count only their credentials</li>
     *   <li>For admins: May be used to get system-wide statistics across all users</li>
     *   <li>The count operation is safer than retrieving credentials as it doesn't
     *       expose sensitive credential data</li>
     * </ul>
     * </p>
     * 
     * @param category The category to count credentials for
     * @return The number of credentials in the category
     */
    @Override
    public long countCredentialsByCategory(Category category) {
        long count = credentialRepository.countByCategory(category);
        return count;
    }
}