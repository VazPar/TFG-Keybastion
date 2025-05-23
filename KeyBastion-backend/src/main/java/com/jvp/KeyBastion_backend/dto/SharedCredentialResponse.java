package com.jvp.KeyBastion_backend.dto;

import java.time.LocalDate;
import java.util.UUID;

import lombok.Data;

@Data
public class SharedCredentialResponse {
    private UUID sharingId;
    private UUID credentialId;
    private String accountName;
    private String serviceUrl;
    private String notes;
    private UUID sharedByUserId;
    private String sharedByUsername;
    private UUID sharedWithUserId;
    private String sharedWithUsername;
    private LocalDate expirationDate;
    private Boolean isAccepted;
}
