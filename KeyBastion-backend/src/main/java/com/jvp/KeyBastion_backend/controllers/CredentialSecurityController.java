package com.jvp.KeyBastion_backend.controllers;

import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.jvp.KeyBastion_backend.model.Credential;
import com.jvp.KeyBastion_backend.model.User;
import com.jvp.KeyBastion_backend.services.CredentialService;
import com.jvp.KeyBastion_backend.util.PasswordEncryptor;

/**
 * Controller responsible for security-related operations on credentials.
 * 
 * This controller handles operations related to the security aspects of credentials,
 * such as PIN verification and management. It provides endpoints for:
 * - Verifying a user's security PIN and retrieving decrypted passwords
 * - Setting or updating a user's security PIN
 * 
 * These operations are separated from the main credential CRUD operations to maintain
 * a clearer separation of concerns and improve maintainability.
 */
@RestController
@RequestMapping("/api/credential-security")
public class CredentialSecurityController extends BaseController {

    /**
     * Check if the current user has ROLE_USER authority
     * This method verifies that the authenticated user has the appropriate role
     * to access credential-related functionality.
     */
    protected void checkUserRole() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        boolean hasValidRole = authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_USER") || a.getAuthority().equals("ROLE_ADMIN"));
        
        if (!hasValidRole) {
            throw new AccessDeniedException("Only users with appropriate roles can access this resource");
        }
    }

    @Autowired
    private CredentialService credentialService;

    @Autowired
    private PasswordEncryptor passwordEncryptor;

    /**
     * Verifies a user's security PIN and retrieves the decrypted password for a credential.
     * <p>
     * This method implements a critical security gate that requires users to verify their
     * identity with a secondary PIN before accessing sensitive credential data. The method
     * performs several validation checks:
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
    @PostMapping("/credentials/{id}/verify-pin")
    public ResponseEntity<?> verifyPinAndGetPassword(@PathVariable UUID id, @RequestBody Map<String, String> request) {
        // Check if user has the correct role
        checkUserRole();
        
        User currentUser = getCurrentUser();
        String pin = request.get("pin");

        if (pin == null || pin.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "PIN is required"));
        }

        // Check if user has a PIN set
        if (currentUser.getSecurityPin() == null) {
            return ResponseEntity.status(403).body(Map.of(
                "error", "You need to set a security PIN first",
                "needsPin", true,
                "message", "Please set a security PIN to view passwords"
            ));
        }

        // Verify the PIN
        if (!pin.equals(currentUser.getSecurityPin())) {
            return ResponseEntity.status(401).body(Map.of("error", "Invalid PIN"));
        }

        // Get the credential
        Optional<Credential> credential = credentialService.findCredentialById(id);

        if (credential.isPresent() && credential.get().getUser().getId().equals(currentUser.getId())) {
            Credential cred = credential.get();

            // Decrypt the password
            String decryptedPassword = passwordEncryptor.decrypt(cred.getEncryptedPassword());

            return ResponseEntity.ok(Map.of("password", decryptedPassword));
        }

        return ResponseEntity.notFound().build();
    }

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
    @PostMapping("/set-pin")
    public ResponseEntity<?> setSecurityPin(@RequestBody Map<String, String> request) {
        // Check if user has the correct role
        checkUserRole();
        
        User currentUser = getCurrentUser();
        String pin = request.get("pin");

        if (pin == null || pin.length() < 4 || pin.length() > 6) {
            return ResponseEntity.badRequest().body(Map.of("error", "PIN must be 4-6 digits"));
        }
        currentUser.setSecurityPin(pin);
        userService.updateUser(currentUser);

        return ResponseEntity.ok(Map.of("message", "Security PIN set successfully"));
    }
}
