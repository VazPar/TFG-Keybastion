package com.jvp.KeyBastion_backend.controllers;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.jvp.KeyBastion_backend.dto.ShareCredentialRequest;
import com.jvp.KeyBastion_backend.dto.SharedCredentialResponse;
import com.jvp.KeyBastion_backend.model.ActivityLog;
import com.jvp.KeyBastion_backend.model.Credential;
import com.jvp.KeyBastion_backend.model.Sharing;
import com.jvp.KeyBastion_backend.model.User;
import com.jvp.KeyBastion_backend.services.ActivityLogService;
import com.jvp.KeyBastion_backend.services.CredentialService;
import com.jvp.KeyBastion_backend.services.SharingService;
import com.jvp.KeyBastion_backend.services.UserService;

import java.util.stream.Collectors;

/**
 * REST controller for managing credential sharing between users.
 * Provides endpoints for sharing, accepting, listing, and revoking shared credentials.
 */
@RestController
@RequestMapping("/api/sharing")
public class SharingController {

    @Autowired
    private SharingService sharingService;
    
    @Autowired
    private UserService userService;
    
    @Autowired
    private CredentialService credentialService;
    
    @Autowired
    private ActivityLogService activityLogService;
    
    // Get current authenticated user
    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        return userService.findUserByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
    
    /**
     * Returns minimal sharing-related info for the current authenticated user.
     *
     * @return Map with user ID and username
     */
    @GetMapping("/me")
    public ResponseEntity<Map<String, Object>> getCurrentUserSharingInfo() {
        User user = getCurrentUser();
        
        Map<String, Object> sharingInfo = Map.of(
            "id", user.getId(),
            "username", user.getUsername()
        );
        
        return ResponseEntity.ok(sharingInfo);
    }
    
    /**
     * Shares a credential with another user after validating PIN and ownership.
     *
     * @param request ShareCredentialRequest containing credential ID, recipient user ID, and security PIN
     * @return ResponseEntity with sharing result or error message
     */
    @PostMapping("/share")
    public ResponseEntity<?> createSharing(@RequestBody ShareCredentialRequest request) {
        User currentUser = getCurrentUser();
        
        // Check if user has a PIN set
        if (currentUser.getSecurityPin() == null || currentUser.getSecurityPin().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "You need to set a security PIN first before sharing credentials"));
        }
        
        // Verify the PIN
        if (request.getSecurityPin() == null || !request.getSecurityPin().equals(currentUser.getSecurityPin())) {
            return ResponseEntity.status(401).body(Map.of("error", "Invalid security PIN"));
        }
        
        // Validate credential ownership
        Optional<Credential> credentialOpt = credentialService.findCredentialById(request.getCredentialId());
        if (credentialOpt.isEmpty() || !credentialOpt.get().getUser().getId().equals(currentUser.getId())) {
            return ResponseEntity.badRequest().body(Map.of("error", "Credential not found or not owned by you"));
        }
        
        // Find user to share with
        Optional<User> targetUserOpt = userService.findUserById(request.getSharedWithUserId());
        if (targetUserOpt.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Target user not found"));
        }
        
        User targetUser = targetUserOpt.get();
        
        // Don't allow sharing with yourself
        if (targetUser.getId().equals(currentUser.getId())) {
            return ResponseEntity.badRequest().body(Map.of("error", "Cannot share with yourself"));
        }
        
        // Create sharing record
        Sharing sharing = new Sharing();
        sharing.setCredential(credentialOpt.get());
        sharing.setSharedByUser(currentUser);
        sharing.setSharedWithUser(targetUser);
        
        // Set expiration date (default to 30 days from now)
        LocalDate expirationDate = request.getExpirationDate() != null ? 
                request.getExpirationDate() : LocalDate.now().plusDays(30);
        sharing.setExpirationDate(expirationDate);
        
        // Generate a unique access token
        sharing.setAccessToken(UUID.randomUUID().toString());
        
        // Save the sharing
        Sharing savedSharing = sharingService.createSharing(sharing);
        
        // Log the activity
        ActivityLog activityLog = new ActivityLog();
        activityLog.setUser(currentUser);
        activityLog.setAction("SHARE");
        activityLog.setDescription("Shared credential '" + credentialOpt.get().getAccountName() + "' with " + targetUser.getUsername());
        activityLog.setTimestamp(LocalDateTime.now());
        activityLog.setIpAddress("127.0.0.1"); // Default IP for local actions
        activityLogService.logActivity(activityLog);
        
        return ResponseEntity.ok(Map.of(
            "message", "Credential shared successfully",
            "sharingId", savedSharing.getId()
        ));
    }
    
    @PostMapping("/{id}/accept")
    public ResponseEntity<?> acceptSharing(@PathVariable UUID id, @RequestBody Map<String, String> request) {
        User currentUser = getCurrentUser();
        
        // Check if user has a PIN set
        if (currentUser.getSecurityPin() == null || currentUser.getSecurityPin().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "You need to set a security PIN first before accepting shared credentials"));
        }
        
        // Verify the PIN
        String securityPin = request.get("securityPin");
        if (securityPin == null || !securityPin.equals(currentUser.getSecurityPin())) {
            return ResponseEntity.status(401).body(Map.of("error", "Invalid security PIN"));
        }
        
        Optional<Sharing> sharingOpt = sharingService.findSharingById(id);
        
        if (sharingOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        
        Sharing sharing = sharingOpt.get();
        
        // Verify that the current user is the recipient
        if (!sharing.getSharedWithUser().getId().equals(currentUser.getId())) {
            return ResponseEntity.status(403).body(Map.of("error", "Not authorized to accept this sharing"));
        }
        
        // Check if already accepted
        if (sharing.getAccepted()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Sharing already accepted"));
        }
        
        // Accept the sharing
        sharing.setAccepted(true);
        sharingService.createSharing(sharing);
        
        // Log the activity
        ActivityLog activityLog = new ActivityLog();
        activityLog.setUser(currentUser);
        activityLog.setAction("ACCEPT");
        activityLog.setDescription("Accepted shared credential '" + sharing.getCredential().getAccountName() + "' from " + sharing.getSharedByUser().getUsername());
        activityLog.setTimestamp(LocalDateTime.now());
        activityLog.setIpAddress("127.0.0.1"); // Default IP for local actions
        activityLogService.logActivity(activityLog);
        
        return ResponseEntity.ok(Map.of("message", "Sharing accepted successfully"));
    }
    
    /**
     * Retrieves all credentials shared by the current user (as owner).
     *
     * @return List of SharedCredentialResponse objects
     */
    @GetMapping("/shared-by-me")
    public ResponseEntity<List<SharedCredentialResponse>> getCredentialsSharedByMe() {
        User currentUser = getCurrentUser();
        List<Sharing> sharings = sharingService.findSharingsByOwner(currentUser);
        
        List<SharedCredentialResponse> responses = sharings.stream()
            .map(this::convertToSharedResponse)
            .collect(Collectors.toList());
        
        return ResponseEntity.ok(responses);
    }
    
    /**
     * Retrieves all credentials shared with the current user (as recipient).
     *
     * @return List of SharedCredentialResponse objects
     */
    @GetMapping("/shared-with-me")
    public ResponseEntity<List<SharedCredentialResponse>> getCredentialsSharedWithMe() {
        User currentUser = getCurrentUser();
        List<Sharing> sharings = sharingService.findSharingsBySharedWithUser(currentUser);
        
        List<SharedCredentialResponse> responses = sharings.stream()
            .map(this::convertToSharedResponse)
            .collect(Collectors.toList());
        
        return ResponseEntity.ok(responses);
    }
    
    /**
     * Revokes or removes a sharing entry. Only the owner or recipient can remove.
     * Requires security PIN validation.
     *
     * @param id UUID of the sharing entry
     * @param request Map containing the securityPin
     * @return ResponseEntity with result or error message
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> removeSharing(@PathVariable UUID id, @RequestBody Map<String, String> request) {
        User currentUser = getCurrentUser();
        
        // Check if user has a PIN set
        if (currentUser.getSecurityPin() == null || currentUser.getSecurityPin().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "You need to set a security PIN first before removing shared credentials"));
        }
        
        // Verify the PIN
        String securityPin = request.get("securityPin");
        if (securityPin == null || !securityPin.equals(currentUser.getSecurityPin())) {
            return ResponseEntity.status(401).body(Map.of("error", "Invalid security PIN"));
        }
        
        Optional<Sharing> sharingOpt = sharingService.findSharingById(id);
        
        if (sharingOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        
        Sharing sharing = sharingOpt.get();
        
        // Only the owner or the recipient can remove the sharing
        if (!sharing.getSharedByUser().getId().equals(currentUser.getId()) && 
            !sharing.getSharedWithUser().getId().equals(currentUser.getId())) {
            return ResponseEntity.status(403).body(Map.of("error", "Not authorized to remove this sharing"));
        }
        
        // Log the activity
        ActivityLog activityLog = new ActivityLog();
        activityLog.setUser(currentUser);
        activityLog.setAction("DELETE");
        activityLog.setDescription(sharing.getSharedByUser().getId().equals(currentUser.getId()) ?
                "Revoked sharing of credential '" + sharing.getCredential().getAccountName() + "' with " + sharing.getSharedWithUser().getUsername() :
                "Removed shared credential '" + sharing.getCredential().getAccountName() + "' from " + sharing.getSharedByUser().getUsername());
        activityLog.setTimestamp(LocalDateTime.now());
        activityLog.setIpAddress("127.0.0.1"); // Default IP for local actions
        activityLogService.logActivity(activityLog);
        
        // Delete the sharing
        sharingService.revokeSharingById(id);
        
        return ResponseEntity.ok(Map.of("message", "Sharing removed successfully"));
    }
    
    // Helper method to convert Sharing to SharedCredentialResponse
    private SharedCredentialResponse convertToSharedResponse(Sharing sharing) {
        SharedCredentialResponse response = new SharedCredentialResponse();
        response.setSharingId(sharing.getId());
        response.setCredentialId(sharing.getCredential().getId());
        response.setAccountName(sharing.getCredential().getAccountName());
        response.setServiceUrl(sharing.getCredential().getServiceUrl());
        response.setNotes(sharing.getCredential().getNotes());
        response.setSharedByUserId(sharing.getSharedByUser().getId());
        response.setSharedByUsername(sharing.getSharedByUser().getUsername());
        response.setSharedWithUserId(sharing.getSharedWithUser().getId());
        response.setSharedWithUsername(sharing.getSharedWithUser().getUsername());
        response.setExpirationDate(sharing.getExpirationDate());
        response.setIsAccepted(sharing.getAccepted());
        
        // Don't include the actual password
        return response;
    }
}
