package com.jvp.KeyBastion_backend.dto;

import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SaveCredentialRequest {
    private String accountName;
    private String password;
    private String serviceUrl;
    private String notes;
    private UUID categoryId;
    
    // Atributos de generación de contraseña
    private Integer passwordLength;
    private Boolean includeLowercase;
    private Boolean includeUppercase;
    private Boolean includeNumbers;
    private Boolean includeSpecial;
    private Integer passwordStrength;
}
