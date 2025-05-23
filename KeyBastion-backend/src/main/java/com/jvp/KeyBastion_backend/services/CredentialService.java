package com.jvp.KeyBastion_backend.services;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import com.jvp.KeyBastion_backend.model.Category;
import com.jvp.KeyBastion_backend.model.Credential;
import com.jvp.KeyBastion_backend.model.User;

/**
 * CredentialService defines operations for managing user credentials in KeyBastion.
 * <p>
 * Provides methods for creating, updating, deleting, and retrieving credentials.
 */
public interface CredentialService {

    /**
     * Creates a new credential entry for a user.
     *
     * @param credential The Credential object to create
     * @param ipAddress  The IP address of the client performing the action
     * @return The created Credential object
     */
    Credential createCredential(Credential credential, String ipAddress);

    /**
     * Finds a credential by its unique ID.
     *
     * @param id UUID of the credential
     * @return Optional containing the Credential if found, or empty if not
     */
    Optional<Credential> findCredentialById(UUID id);

    /**
     * Retrieves all credentials belonging to a specific user.
     * 
     * @param user The User object whose credentials to retrieve
     * @return A List of Credential objects associated with the user
     */
    List<Credential> findCredentialsByUser(User user);

    /**
     * Retrieves all credentials belonging to a specific user and category.
     * 
     * @param user The User object whose credentials to retrieve
     * @param category The Category object whose credentials to retrieve
     * @return A List of Credential objects associated with the user and category
     */
    List<Credential> findCredentialsByUserAndCategory(User user, Category category);

    /**
     * Retrieves all credentials belonging to a specific category.
     * 
     * @param category The Category object whose credentials to retrieve
     * @return A List of Credential objects associated with the category
     */
    List<Credential> findCredentialsByCategory(Category category);

    /**
     * Updates an existing credential's information if it exists.
     *
     * @param credential The Credential object with updated data
     * @param ipAddress  The IP address of the client performing the action
     * @return The updated Credential object
     * @throws RuntimeException if the credential does not exist
     */
    Credential updateCredential(Credential credential, String ipAddress);

    /**
     * Deletes a credential by its unique ID.
     *
     * @param id        UUID of the credential to delete
     * @param ipAddress The IP address of the client performing the action
     */
    void deleteCredentialById(UUID id, String ipAddress);

    List<Credential> findCredentialsByAccountNameContaining(String accountName);
    
    /**
     * Counts the number of credentials in a specific category.
     *
     * @param category The category to count credentials for
     * @return The number of credentials in the category
     */
    long countCredentialsByCategory(Category category);
}
