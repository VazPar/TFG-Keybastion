package com.jvp.KeyBastion_backend.controllers;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.jvp.KeyBastion_backend.dto.SaveCredentialRequest;
import com.jvp.KeyBastion_backend.model.Credential;
import com.jvp.KeyBastion_backend.model.Sharing;
import com.jvp.KeyBastion_backend.model.User;
import com.jvp.KeyBastion_backend.services.ActivityLogService;
import com.jvp.KeyBastion_backend.services.CategoryService;
import com.jvp.KeyBastion_backend.services.CredentialService;
import com.jvp.KeyBastion_backend.services.SharingService;
import com.jvp.KeyBastion_backend.util.PasswordEncryptor;
import jakarta.servlet.http.HttpServletRequest;

import java.util.HashMap;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Controller responsible for core CRUD operations on credentials.
 * 
 * This controller handles the basic Create, Read, Update, and Delete operations
 * for credential management. It provides endpoints for:
 * - Creating new credentials
 * - Retrieving credentials (individual or lists)
 * - Updating existing credentials
 * - Deleting credentials
 * 
 * Note: This controller has been refactored to focus solely on CRUD operations.
 * Security-related operations (PIN verification, password viewing) have been moved to
 * {@link CredentialSecurityController}, and statistics operations have been moved to
 * {@link CredentialStatsController}.
 */
@RestController
@RequestMapping("/api/credentials")
public class CredentialController extends BaseController {

    private static final Logger logger = LoggerFactory.getLogger(CredentialController.class);

    @Autowired
    private CredentialService credentialService;

    @Autowired
    private CategoryService categoryService;

    @Autowired
    private PasswordEncryptor passwordEncryptor;

    @Autowired
    private SharingService sharingService;
    
    @Autowired
    private ActivityLogService activityLogService;
    
    // Check if the current user has ROLE_USER authority
    protected void checkUserRole() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        boolean hasValidRole = authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_USER") || a.getAuthority().equals("ROLE_ADMIN"));
        
        if (!hasValidRole) {
            throw new AccessDeniedException("Only users with appropriate roles can access this resource");
        }
    }

    /**
     * Creates a new credential for the authenticated user.
     *
     * @param request The credential creation request data
     * @param httpRequest The HTTP servlet request (for IP extraction)
     * @return The created credential
     */
    @PostMapping
    public ResponseEntity<Credential> createCredential(@RequestBody SaveCredentialRequest request, HttpServletRequest httpRequest) {
        // Check if user has the correct role
        checkUserRole();
        
        User currentUser = getCurrentUser();

        Credential credential = new Credential();
        credential.setAccountName(request.getAccountName());

        // Encrypt the password before storing it
        String encryptedPassword = passwordEncryptor.encrypt(request.getPassword());
        credential.setEncryptedPassword(encryptedPassword);

        credential.setServiceUrl(request.getServiceUrl());
        credential.setNotes(request.getNotes());
        credential.setCreatedAt(LocalDateTime.now());
        credential.setUser(currentUser);

        // Set password generation attributes
        credential.setPasswordLength(request.getPasswordLength());
        credential.setIncludeLowercase(request.getIncludeLowercase());
        credential.setIncludeUppercase(request.getIncludeUppercase());
        credential.setIncludeNumbers(request.getIncludeNumbers());
        credential.setIncludeSpecial(request.getIncludeSpecial());
        credential.setPasswordStrength(request.getPasswordStrength());

        if (request.getCategoryId() != null) {
            categoryService.findCategoryById(request.getCategoryId())
                    .ifPresent(credential::setCategory);
        }

        String clientIp = getClientIp();
        
        // Create credential and log the activity separately
        // We'll initially save the credential without logging
        Credential savedCredential = credentialService.createCredential(credential, null);
        
        // Log activity using our convenience method
        activityLogService.createAndLogActivity(
            currentUser,
            "CREATE",
            "Created credential: '" + savedCredential.getAccountName() + "'",
            clientIp
        );

        // Clear the encrypted password from the response for security
        savedCredential.setEncryptedPassword("[PROTECTED]");

        return ResponseEntity.ok(savedCredential);
    }

    @GetMapping
    public ResponseEntity<Map<String, Object>> getUserCredentials() {
        // Check if user has the correct role
        checkUserRole();
        
        User currentUser = getCurrentUser();

        // Get user's own credentials
        List<Credential> ownCredentials = credentialService.findCredentialsByUser(currentUser);

        // Get credentials shared with this user
        List<Credential> sharedCredentials = sharingService.findSharingsBySharedWithUser(currentUser)
                .stream()
                .filter(sharing -> sharing.getAccepted()) // Only include accepted sharings
                .map(sharing -> {
                    Credential cred = sharing.getCredential();
                    // Add owner information to credential
                    cred.setSharedBy(sharing.getSharedByUser());
                    cred.setSharedId(sharing.getId());
                    return cred;
                })
                .collect(Collectors.toList());

        // Mask encrypted passwords in all credentials
        List<Map<String, Object>> ownCredentialsList = ownCredentials.stream()
                .map(credential -> {
                    Map<String, Object> credMap = new HashMap<>();
                    credMap.put("id", credential.getId());
                    credMap.put("accountName", credential.getAccountName());
                    credMap.put("serviceUrl", credential.getServiceUrl());
                    credMap.put("notes", credential.getNotes());
                    credMap.put("createdAt", credential.getCreatedAt());
                    credMap.put("category", credential.getCategory());
                    credMap.put("owner", Map.of(
                            "id", currentUser.getId(),
                            "username", currentUser.getUsername()));
                    credMap.put("isOwner", true);
                    return credMap;
                })
                .collect(Collectors.toList());

        List<Map<String, Object>> sharedCredentialsList = sharedCredentials.stream()
                .map(credential -> {
                    Map<String, Object> credMap = new HashMap<>();
                    credMap.put("id", credential.getId());
                    credMap.put("accountName", credential.getAccountName());
                    credMap.put("serviceUrl", credential.getServiceUrl());
                    credMap.put("notes", credential.getNotes());
                    credMap.put("createdAt", credential.getCreatedAt());
                    credMap.put("category", credential.getCategory());
                    credMap.put("owner", Map.of(
                            "id", credential.getUser().getId(),
                            "username", credential.getUser().getUsername()));
                    credMap.put("isOwner", false);
                    credMap.put("sharedBy", Map.of(
                            "id", credential.getSharedBy().getId(),
                            "username", credential.getSharedBy().getUsername()));
                    credMap.put("sharingId", credential.getSharedId());
                    return credMap;
                })
                .collect(Collectors.toList());

        // Combine both lists
        Map<String, Object> response = new HashMap<>();
        response.put("ownCredentials", ownCredentialsList);
        response.put("sharedCredentials", sharedCredentialsList);

        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Credential> getCredentialById(@PathVariable UUID id) {
        // Check if user has the correct role
        checkUserRole();
        
        User currentUser = getCurrentUser();
        Optional<Credential> credential = credentialService.findCredentialById(id);

        if (credential.isPresent() && credential.get().getUser().getId().equals(currentUser.getId())) {
            // Mask encrypted password in the response
            Credential cred = credential.get();
            cred.setEncryptedPassword("[PROTECTED]");
            return ResponseEntity.ok(cred);
        }

        return ResponseEntity.notFound().build();
    }

    /**
     * Updates an existing credential for the authenticated user.
     *
     * @param id The credential ID
     * @param request The credential update request data
     * @param httpRequest The HTTP servlet request (for IP extraction)
     * @return The updated credential or 404 if not found
     */
    @PutMapping("/{id}")
    public ResponseEntity<Credential> updateCredential(@PathVariable UUID id, @RequestBody SaveCredentialRequest request, HttpServletRequest httpRequest) {
        // Check if user has the correct role
        checkUserRole();

        User currentUser = getCurrentUser();
        Optional<Credential> existingCredential = credentialService.findCredentialById(id);

        if (existingCredential.isPresent() && existingCredential.get().getUser().getId().equals(currentUser.getId())) {
            Credential credential = existingCredential.get();
            credential.setAccountName(request.getAccountName());

            // Only update password if a new one is provided
            if (request.getPassword() != null && !request.getPassword().isEmpty()) {
                String encryptedPassword = passwordEncryptor.encrypt(request.getPassword());
                credential.setEncryptedPassword(encryptedPassword);

                // Update password generation attributes if password is changed
                credential.setPasswordLength(request.getPasswordLength());
                credential.setIncludeLowercase(request.getIncludeLowercase());
                credential.setIncludeUppercase(request.getIncludeUppercase());
                credential.setIncludeNumbers(request.getIncludeNumbers());
                credential.setIncludeSpecial(request.getIncludeSpecial());
                credential.setPasswordStrength(request.getPasswordStrength());
            }

            credential.setServiceUrl(request.getServiceUrl());
            credential.setNotes(request.getNotes());

            if (request.getCategoryId() != null) {
                categoryService.findCategoryById(request.getCategoryId())
                        .ifPresent(credential::setCategory);
            }

            String clientIp = httpRequest.getRemoteAddr();
            Credential updatedCredential = credentialService.updateCredential(credential, clientIp);

            // Mask encrypted password in the response
            updatedCredential.setEncryptedPassword("[PROTECTED]");

            return ResponseEntity.ok(updatedCredential);
        }

        return ResponseEntity.notFound().build();
    }

    /**
     * Deletes a credential for the authenticated user.
     * <p>
     * If the credential is shared with other users, this method requires a confirmation
     * flag to be set to true before proceeding with deletion. This prevents accidental
     * deletion of shared credentials. When a shared credential is deleted, all sharing
     * entries are deleted first to maintain database integrity, and each deletion is
     * logged in the activity log.
     * </p>
     *
     * @param id The credential ID to delete
     * @param confirm Confirmation flag (true) to proceed with deletion if credential is shared
     * @param httpRequest The HTTP servlet request (for IP address extraction for activity logging)
     * @return ResponseEntity with: 204 No Content if deleted successfully, 404 Not Found if credential doesn't exist,
     *         409 Conflict with warning message if credential is shared and requires confirmation,
     *         or 500 Internal Server Error if deletion fails
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteCredential(@PathVariable UUID id, @RequestParam(value = "confirm", required = false) Boolean confirm, HttpServletRequest httpRequest) {
        // Check if user has the correct role
        checkUserRole();
        
        User currentUser = getCurrentUser();
        Optional<Credential> credentialOpt = credentialService.findCredentialById(id);

        if (credentialOpt.isPresent() && credentialOpt.get().getUser().getId().equals(currentUser.getId())) {
            Credential credential = credentialOpt.get();
            String clientIp = httpRequest.getRemoteAddr();
            
            // Check if credential is currently shared
            boolean isShared = sharingService.isCredentialShared(credential);
            
            if (isShared && (confirm == null || !confirm)) {
                return ResponseEntity.status(409).body(Map.of(
                    "warning", "This credential is currently shared. Deleting it will revoke access for all shared users. Do you want to proceed?",
                    "requiresConfirmation", true
                ));
            }
            
            try {
                // If shared and confirmed, delete all shares first
                if (isShared && confirm != null && confirm) {
                    // Find all shares for this credential and delete them
                    List<Sharing> shares = sharingService.findSharingsByCredential(credential);
                    
                    // Process each share - capture usernames for logging before deletion
                    for (Sharing share : shares) {
                        // Store necessary info for logging before deletion
                        String sharedWithUsername = share.getSharedWithUser().getUsername();
                        UUID shareId = share.getId();
                        
                        // Log the share deletion first
                        activityLogService.createAndLogActivity(
                            currentUser,
                            "DELETE",
                            "Revoked sharing of credential \"" + credential.getAccountName() + "\" with user " + sharedWithUsername,
                            clientIp
                        );
                        
                        // Delete the share using the ID (avoids detached entity issues)
                        sharingService.revokeSharingById(shareId);
                    }
                }
                
                // Now delete the credential
                credentialService.deleteCredentialById(id, clientIp);
                return ResponseEntity.noContent().build();
            } catch (Exception e) {
                // Log the full exception for debugging
                logger.error("Error deleting credential: " + id, e);
                return ResponseEntity.status(500).body(Map.of(
                    "error", "Failed to delete credential: " + e.getMessage(),
                    "details", e.getClass().getName()
                ));
            }
        }

        return ResponseEntity.notFound().build();
    }

    /**
     * Verifies a user's security PIN and retrieves the decrypted password for a credential.
     * <p>
     * This method implements a critical security gate that requires users to verify their
     * identity with a secondary PIN before accessing sensitive credential data. The PIN acts as
     * a second layer of protection beyond the user's login credentials, helping prevent unauthorized
     * access in case of session hijacking or an unattended authenticated session.
     * </p>
     * <p>
     * The method validates that:
     * 1. The PIN is provided and matches the user's stored PIN
     * 2. The user has a PIN set (returns guidance if not)
     * 3. The user has permission to access the requested credential
     * </p>
     * <p>
     * If successful, returns the decrypted password. On failure, returns appropriate error messages
     * with specific HTTP status codes to enable proper frontend handling.
     * </p>
     *
     * @param id The UUID of the credential whose password is being requested
     * @param request Map containing "pin" - the user's security PIN for verification
     * @return ResponseEntity with the decrypted password on success, or an appropriate error response:
     *         - 400 Bad Request: Missing PIN
     *         - 401 Unauthorized: Invalid PIN
     *         - 403 Forbidden: No PIN set (includes needsPin flag)
     *         - 404 Not Found: Credential not found or not owned by user
     */
    // This method has been moved to CredentialSecurityController

    /**
     * Sets or updates a user's security PIN for accessing sensitive credential information.
     * <p>
     * The security PIN is a fundamental security feature of KeyBastion that provides
     * an additional authentication factor beyond the user's primary login credentials.
     * This PIN is required whenever a user attempts to view a decrypted password, adding
     * a critical layer of protection against unauthorized access to sensitive information.
     * </p>
     * <p>
     * This endpoint enforces PIN format requirements (4-6 digits) and updates the user's
     * profile with the encrypted PIN. The PIN is stored securely and is required for
     * all subsequent password decryption operations.
     * </p>
     *
     * @param request Map containing "pin" - the new security PIN to set
     * @return ResponseEntity with success message or error details
     *         - 200 OK: PIN successfully set
     *         - 400 Bad Request: Invalid PIN format
     */
    // This method has been moved to CredentialSecurityController
}
