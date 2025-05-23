package com.jvp.KeyBastion_backend.services;

import com.jvp.KeyBastion_backend.model.Credential;
import com.jvp.KeyBastion_backend.model.Sharing;
import com.jvp.KeyBastion_backend.model.User;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * SharingService is responsible for managing the sharing of credentials between users in KeyBastion.
 * It provides methods for creating, retrieving, and revoking shared credentials, as well as finding
 * sharing entries by various criteria.
 */
public interface SharingService {
    /**
     * Checks if a credential is currently shared (has active sharings not expired).
     * @param credential The credential to check
     * @return true if credential is shared, false otherwise
     */
    boolean isCredentialShared(Credential credential);

    /**
     * Creates a new sharing entry for a credential between users.
     *
     * @param sharing The Sharing object to create
     * @return The created Sharing object
     */
    Sharing createSharing(Sharing sharing);

    /**
     * Finds a sharing entry by its unique ID.
     *
     * @param id UUID of the sharing entry
     * @return Optional containing the Sharing if found, or empty if not
     */
    Optional<Sharing> findSharingById(UUID id);

    /**
     * Retrieves all sharing entries created by a specific owner.
     *
     * @param owner The user who owns the shared credentials
     * @return List of Sharing objects created by the owner
     */
    List<Sharing> findSharingsByOwner(User owner);

    /**
     * Retrieves all sharing entries received by a specific user.
     *
     * @param sharedWithUser The user who received the shared credentials
     * @return List of Sharing objects received by the user
     */
    List<Sharing> findSharingsBySharedWithUser(User sharedWithUser);

    /**
     * Finds a sharing entry by its access token.
     *
     * @param accessToken The access token of the sharing entry
     * @return Optional containing the Sharing if found, or empty if not
     */
    Optional<Sharing> findSharingByAccessToken(String accessToken);

    /**
     * Revokes (deletes) a sharing entry by its unique ID.
     *
     * @param id UUID of the sharing entry to revoke
     */
    void revokeSharingById(UUID id);

    /**
     * Retrieves all sharing entries that have expired.
     *
     * @return List of Sharing objects that have expired
     */
    List<Sharing> findExpiredSharings();

    /**
     * Counts the number of active sharing entries for a specific user.
     *
     * @param user The user for whom to count active sharing entries
     * @return The number of active sharing entries for the user
     */
    int countActiveSharingsByUser(User user);

    /**
     * Retrieves all sharing entries in the system.
     *
     * @return List of all Sharing objects
     */
    List<Sharing> findAllSharings();
    
    /**
     * Retrieves all sharing entries for a specific credential.
     *
     * @param credential The credential whose sharings to retrieve
     * @return List of Sharing objects for the credential
     */
    List<Sharing> findSharingsByCredential(Credential credential);
}
