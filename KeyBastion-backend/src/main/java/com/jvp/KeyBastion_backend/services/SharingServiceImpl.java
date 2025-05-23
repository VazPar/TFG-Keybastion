package com.jvp.KeyBastion_backend.services;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.jvp.KeyBastion_backend.model.Credential;
import com.jvp.KeyBastion_backend.model.Sharing;
import com.jvp.KeyBastion_backend.model.User;
import com.jvp.KeyBastion_backend.repositories.SharingRepository;

@Service
/**
 * Implementation of SharingService for KeyBastion's secure credential sharing system.
 * <p>
 * This service handles the creation, management, and revocation of credential sharing between users.
 * It provides methods for tracking shared credentials, managing access tokens, and handling
 * sharing operations securely. It directly interacts with SharingRepository for database operations
 * and maintains referential integrity throughout the credential lifecycle.
 * </p>
 * <p>
 * Sharing is a core functionality of KeyBastion that allows users to securely share their
 * stored credentials with other users in the system, with features including:
 * <ul>
 *   <li>Time-based access control with expiration dates</li>
 *   <li>Selective sharing with specific users</li>
 *   <li>Unique access tokens for each sharing relationship</li>
 *   <li>Revocation capabilities for immediate access termination</li>
 *   <li>Complete audit trail through activity logging</li>
 * </ul>
 * </p>
 * <p>
 * This service plays a critical role in maintaining database integrity during credential
 * deletion operations. When a shared credential is deleted, all associated sharing entries
 * must be deleted first to prevent orphaned records and maintain proper referential integrity.
 * Methods like {@link #findSharingsByCredential(Credential)} and {@link #isCredentialShared(Credential)}
 * support this workflow.
 * </p>
 */
public class SharingServiceImpl implements SharingService {
    /**
     * Determines if a credential is currently shared with any user.
     * <p>
     * This method checks if there are any active sharing entries for the given credential
     * that have not yet expired. It's used in the credential deletion workflow to determine
     * if a confirmation is required before deletion, as deleting a shared credential affects
     * multiple users.
     * </p>
     *
     * @param credential The credential to check for active sharing entries
     * @return true if the credential is currently shared, false otherwise
     */
    @Override
    public boolean isCredentialShared(Credential credential) {
        LocalDate today = LocalDate.now();
        return !sharingRepository.findActiveSharingsByCredential(credential, today).isEmpty();
    }

    @Autowired
    private SharingRepository sharingRepository;

    /**
     * Creates a new sharing entry for a credential between users.
     *
     * @param sharing The Sharing object to create
     * @return The created Sharing object
     */
    @Override
    public Sharing createSharing(Sharing sharing) {
        return sharingRepository.save(sharing);
    }

    /**
     * Finds a sharing entry by its unique ID.
     *
     * @param id UUID of the sharing entry
     * @return Optional containing the Sharing if found, or empty if not
     */
    public Optional<Sharing> findSharingById(UUID id) {
        return sharingRepository.findById(id);
    }

    /**
     * Retrieves all sharing entries created by a specific owner.
     *
     * @param owner The user who owns the shared credentials
     * @return List of Sharing objects created by the owner
     */
    @Override
    public List<Sharing> findSharingsByOwner(User owner) {
        return sharingRepository.findBySharedByUser(owner);
    }

    /**
     * Retrieves all sharing entries shared with a specific user.
     *
     * @param sharedWithUser The user with whom the credentials are shared
     * @return List of Sharing objects shared with the user
     */
    @Override
    public List<Sharing> findSharingsBySharedWithUser(User sharedWithUser) {
        return sharingRepository.findBySharedWithUser(sharedWithUser);
    }

    /**
     * Finds a sharing entry by its access token.
     *
     * @param accessToken The access token of the sharing entry
     * @return Optional containing the Sharing if found, or empty if not
     */
    @Override
    public Optional<Sharing> findSharingByAccessToken(String accessToken) {
        return sharingRepository.findByAccessToken(accessToken);
    }

    /**
     * Revokes (deletes) a sharing entry by its unique ID.
     * <p>
     * This method immediately terminates access to a shared credential for the target user.
     * It is used in two main workflows:
     * <ol>
     *   <li>When a user manually revokes sharing access for another user</li>
     *   <li>During the shared credential deletion process, where all sharing entries
     *       must be deleted before the credential itself can be safely removed</li>
     * </ol>
     * </p>
     * <p>
     * The method performs a hard delete from the database rather than a soft delete,
     * ensuring that access is completely and immediately terminated. Activity logging for
     * this operation is typically handled at the controller level.
     * </p>
     *
     * @param id UUID of the sharing entry to revoke
     */
    @Override
    public void revokeSharingById(UUID id) {
        sharingRepository.deleteById(id);
    }

    /**
     * Retrieves all sharing entries that have expired.
     *
     * @return List of Sharing objects that have expired
     */
    @Override
    public List<Sharing> findExpiredSharings() {
        return sharingRepository.findExpiredSharings();
    }

    /**
     * Counts the number of active sharing entries for a specific user.
     *
     * @param user The user for whom to count active sharing entries
     * @return The number of active sharing entries for the user
     */
    @Override
    public int countActiveSharingsByUser(User user) {
        // Delegate to repository to count active sharings for the given user
        return sharingRepository.countActiveSharingsByUser(user);
    }

    /**
     * Retrieves all sharing entries in the system.
     *
     * @return List of all Sharing objects
     */
    @Override
    public List<Sharing> findAllSharings() {
        // Retrieve all sharing entries from the repository (admin use or audits)
        return sharingRepository.findAll();
    }
    
    /**
     * Retrieves all sharing entries for a specific credential.
     * <p>
     * This method is crucial for the credential deletion workflow, as it allows the system
     * to find and delete all sharing entries before deleting a credential. This prevents
     * database integrity issues and orphaned sharing records.
     * </p>
     *
     * @param credential The credential whose sharings to retrieve
     * @return List of Sharing objects associated with the specified credential
     */
    @Override
    public List<Sharing> findSharingsByCredential(Credential credential) {
        return sharingRepository.findByCredential(credential);
    }
}