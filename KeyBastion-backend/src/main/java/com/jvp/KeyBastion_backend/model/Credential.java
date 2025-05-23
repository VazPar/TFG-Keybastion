package com.jvp.KeyBastion_backend.model;

import java.time.LocalDateTime;
import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.Transient;
import lombok.Data;

@Entity
@Data
@Table(name = "credentials")
public class Credential {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String accountName;

    @Column(nullable = false)
    private String encryptedPassword; // Encrypted using AES-256

    @Column(nullable = false)
    private String serviceUrl;

    private String notes; // Additional notes

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt; // Timestamp for credential creation

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne
    @JoinColumn(name = "category_id")
    private Category category;
    
    // Atributos para la generación de contraseñas
    private Integer passwordLength;
    
    private Boolean includeLowercase;
    
    private Boolean includeUppercase;
    
    private Boolean includeNumbers;
    
    private Boolean includeSpecial;
    
    private Integer passwordStrength;
    
    // Transient fields for sharing information (not stored in database)
    @Transient
    private User sharedBy;
    
    @Transient
    private UUID sharedId;
}
