package com.jvp.KeyBastion_backend.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

import java.security.interfaces.RSAPrivateKey;
import java.security.interfaces.RSAPublicKey;

@ConfigurationProperties(prefix = "rsa")
public record RsaKeyConfigProperties(RSAPublicKey publicKey, RSAPrivateKey privateKey) {
    // Records automatically generate getters with the same name as the component
    // But SecurityConfig is looking for getPublicKey() and getPrivateKey()
    
    // Add explicit getter methods to maintain compatibility with SecurityConfig
    public RSAPublicKey getPublicKey() {
        return publicKey();
    }
    
    public RSAPrivateKey getPrivateKey() {
        return privateKey();
    }
}
