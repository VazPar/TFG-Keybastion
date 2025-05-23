package com.jvp.KeyBastion_backend.dto;

import lombok.Data;

@Data
public class AcceptSharingRequest {
    private String securityPin; // Required for verification
}
