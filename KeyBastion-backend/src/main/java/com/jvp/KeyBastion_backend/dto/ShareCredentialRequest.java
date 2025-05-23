package com.jvp.KeyBastion_backend.dto;

import java.time.LocalDate;
import java.util.UUID;

import lombok.Data;

@Data
public class ShareCredentialRequest {
    private UUID credentialId;
    private UUID sharedWithUserId;
    private LocalDate expirationDate; // Optional field
    private String securityPin; // Security PIN for verification
}
