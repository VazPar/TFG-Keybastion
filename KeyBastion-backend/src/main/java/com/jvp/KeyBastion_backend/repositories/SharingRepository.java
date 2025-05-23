package com.jvp.KeyBastion_backend.repositories;

import com.jvp.KeyBastion_backend.model.Credential;
import com.jvp.KeyBastion_backend.model.Sharing;
import com.jvp.KeyBastion_backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Repository interface for accessing Sharing data in KeyBastion.
 * <p>
 * Provides methods for querying shared credentials by owner, recipient, and
 * other properties.
 */
public interface SharingRepository extends JpaRepository<Sharing, UUID> {
    /**
     * Finds all active sharing entries for a specific credential.
     * @param credential The credential to check
     * @param currentDate The current date
     * @return List of Sharing objects for the credential that are not expired
     */
    @Query("SELECT s FROM Sharing s WHERE s.credential = :credential AND s.expirationDate > :currentDate")
    List<Sharing> findActiveSharingsByCredential(@Param("credential") Credential credential, @Param("currentDate") LocalDate currentDate);

    /**
     * Finds all sharing entries created by a specific user (as owner).
     *
     * @param sharedByUser The user who shared the credentials
     * @return List of Sharing objects created by the user
     */

    @Query("SELECT s FROM Sharing s WHERE s.sharedByUser = :sharedByUser")
    List<Sharing> findBySharedByUser(@Param("sharedByUser") User sharedByUser);

    /**
     * Finds all sharing entries received by a specific user.
     *
     * @param sharedWithUser The user who received the shared credentials
     * @return List of Sharing objects received by the user
     */
    List<Sharing> findBySharedWithUser(User sharedWithUser);

    /**
     * Finds a sharing entry by its access token.
     *
     * @param accessToken The access token of the sharing entry
     * @return Optional containing the Sharing if found, or empty if not
     */
    Optional<Sharing> findByAccessToken(String accessToken);

    /**
     * Finds all sharing entries that have expired.
     *
     * @return List of Sharing objects that have expired
     */
    @Query("SELECT s FROM Sharing s WHERE s.expirationDate < CURRENT_DATE")
    List<Sharing> findExpiredSharings();

    /**
     * Counts the number of active sharing entries for a specific user.
     *
     * @param user The user for whom to count active sharing entries
     * @return The number of active sharing entries for the user
     */
    @Query("SELECT COUNT(s) FROM Sharing s WHERE s.sharedByUser = :user AND s.expirationDate > CURRENT_DATE")
    int countActiveSharingsByUser(@Param("user") User user);
    
    /**
     * Finds all sharing entries for a specific credential.
     *
     * @param credential The credential whose sharings to retrieve
     * @return List of Sharing objects for the credential
     */
    List<Sharing> findByCredential(Credential credential);
}
