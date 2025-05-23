package com.jvp.KeyBastion_backend.model;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.Data;

/**
 * Entity class representing a user in the KeyBastion password manager system.
 * This class stores all user-related information including authentication details,
 * role, and relationships to other entities like credentials and categories.
 */
@Entity
@Data
@Table(name = "users")
public class User {

    /**
     * Unique identifier for the user.
     * Automatically generated as a UUID.
     */
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    /**
     * Username for the user account.
     * Cannot be null.
     */
    @Column(nullable = false)
    private String username;

    /**
     * Email address for the user account.
     * Must be unique and cannot be null.
     */
    @Column(unique = true, nullable = false)
    private String email;

    /**
     * Password hash for the user account.
     * Stored using BCrypt hashing algorithm for security.
     * Cannot be null.
     */
    @Column(nullable = false)
    private String passwordHash;

    /**
     * Security PIN for additional verification when viewing passwords.
     * Stored in encrypted format.
     */
    @Column(name = "security_pin")
    private String securityPin;

    /**
     * User role determining access permissions in the system.
     * Defaults to USER role if not specified.
     * Cannot be null.
     */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role = Role.USER;

    /**
     * Timestamp when the user account was created.
     * Automatically set to current time on creation and not updatable afterward.
     * Cannot be null.
     */
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    /**
     * List of credentials owned by this user.
     * Lazy-loaded to improve performance.
     * Cascade all operations to child entities.
     */
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Credential> credentials;

    /**
     * List of categories created by this user for organizing credentials.
     * Lazy-loaded to improve performance.
     * Cascade all operations to child entities.
     */
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Category> categories;

    /**
     * List of credentials shared by this user with other users.
     * Lazy-loaded to improve performance.
     * Cascade all operations to child entities.
     */
    @OneToMany(mappedBy = "sharedByUser", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Sharing> sharedCredentials;

    /**
     * List of activity logs recording user actions in the system.
     * Lazy-loaded to improve performance.
     * Cascade all operations to child entities.
     */
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<ActivityLog> activityLogs;

    /**
     * User-specific settings and preferences.
     * Lazy-loaded to improve performance.
     * Cascade all operations to child entity.
     */
    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private UserSettings userSettings;
}
