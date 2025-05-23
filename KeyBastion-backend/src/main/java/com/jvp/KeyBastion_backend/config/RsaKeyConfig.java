package com.jvp.KeyBastion_backend.config;

import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.security.KeyFactory;
import java.security.interfaces.RSAPrivateKey;
import java.security.interfaces.RSAPublicKey;
import java.security.spec.PKCS8EncodedKeySpec;
import java.security.spec.X509EncodedKeySpec;
import java.util.Base64;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.ClassPathResource;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@Configuration
public class RsaKeyConfig {

    @Value("${rsa.public-key-path}")
    private String publicKeyPath;

    @Value("${rsa.private-key-path}")
    private String privateKeyPath;

    @Bean
    public RsaKeyConfigProperties rsaKeyConfigProperties() {
        try {
            RSAPublicKey publicKey = readPublicKey();
            RSAPrivateKey privateKey = readPrivateKey();
            log.info("RSA keys loaded successfully");
            return new RsaKeyConfigProperties(publicKey, privateKey);
        } catch (Exception e) {
            log.error("Failed to load RSA keys: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to load RSA keys", e);
        }
    }

    private RSAPublicKey readPublicKey() throws Exception {
        log.debug("Loading public key from: {}", publicKeyPath);
        ClassPathResource resource = new ClassPathResource("keys/public.pem");
        return getPublicKey(resource);
    }

    private RSAPrivateKey readPrivateKey() throws Exception {
        log.debug("Loading private key from: {}", privateKeyPath);
        ClassPathResource resource = new ClassPathResource("keys/private.pem");
        return getPrivateKey(resource);
    }

    private RSAPublicKey getPublicKey(ClassPathResource resource) throws Exception {
        try (InputStream is = resource.getInputStream()) {
            String key = new String(is.readAllBytes(), StandardCharsets.UTF_8)
                    .replace("-----BEGIN PUBLIC KEY-----", "")
                    .replace("-----END PUBLIC KEY-----", "")
                    .replaceAll("\\s+", "");
            byte[] encoded = Base64.getDecoder().decode(key);
            KeyFactory keyFactory = KeyFactory.getInstance("RSA");
            X509EncodedKeySpec keySpec = new X509EncodedKeySpec(encoded);
            return (RSAPublicKey) keyFactory.generatePublic(keySpec);
        }
    }

    private RSAPrivateKey getPrivateKey(ClassPathResource resource) throws Exception {
        try (InputStream is = resource.getInputStream()) {
            String key = new String(is.readAllBytes(), StandardCharsets.UTF_8)
                    .replace("-----BEGIN PRIVATE KEY-----", "")
                    .replace("-----END PRIVATE KEY-----", "")
                    .replaceAll("\\s+", "");
            byte[] encoded = Base64.getDecoder().decode(key);
            KeyFactory keyFactory = KeyFactory.getInstance("RSA");
            PKCS8EncodedKeySpec keySpec = new PKCS8EncodedKeySpec(encoded);
            return (RSAPrivateKey) keyFactory.generatePrivate(keySpec);
        }
    }
}
