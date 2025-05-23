package com.jvp.KeyBastion_backend.util;

import java.nio.charset.StandardCharsets;
import java.security.InvalidKeyException;
import java.security.Key;
import java.security.NoSuchAlgorithmException;
import java.util.Base64;

import javax.crypto.BadPaddingException;
import javax.crypto.Cipher;
import javax.crypto.IllegalBlockSizeException;
import javax.crypto.NoSuchPaddingException;
import javax.crypto.spec.SecretKeySpec;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

/**
 * Utility class for encrypting and decrypting sensitive password data using AES-256 encryption.
 * <p>
 * This component is a critical part of KeyBastion's security architecture, responsible for ensuring
 * that passwords are never stored in plaintext in the database. The encryption implementation uses
 * industry-standard AES-256 encryption with a configurable encryption key that should be set in
 * the application properties and kept secure.
 * </p>
 * <p>
 * Security features and considerations:
 * <ul>
 *   <li>Uses AES-256 encryption, a strong symmetric encryption algorithm</li>
 *   <li>Encryption key is configurable through application properties</li>
 *   <li>Automatically pads or truncates keys to the required 32-byte length</li>
 *   <li>Handles Base64 encoding/decoding of encrypted data for safe storage</li>
 *   <li>Provides proper exception handling to prevent information leakage</li>
 * </ul>
 * </p>
 * <p>
 * Security Warning: It is critical to change the default encryption key in production environments
 * and secure this key using appropriate key management practices. The encryption key should be treated
 * as a sensitive secret and not included in version control or exposed in logs.
 * </p>
 */
@Component
public class PasswordEncryptor {

    private static final String ALGORITHM = "AES";
    private Key secretKey;

    /**
     * Constructor that initializes the secret key from the application properties.
     * <p>
     * This constructor processes the encryption key from application properties and ensures
     * it meets the requirements for AES-256 encryption (32 bytes). If the provided key is too short,
     * it will be padded; if too long, it will be truncated.
     * </p>
     * <p>
     * Security Note: In production environments, you should always override the default key 
     * by setting the 'keybastion.encryption.key' property to a strong, randomly generated key.
     * The default key is only provided as a fallback for development and testing.
     * </p>
     * <p>
     * CRITICAL SECURITY RECOMMENDATION:
     * For production deployment, implement these encryption key management best practices:
     * <ul>
     *   <li>Use a secure external key management system (HashiCorp Vault, AWS KMS, etc.)</li>
     *   <li>Don't store encryption keys in application properties or code repositories</li>
     *   <li>Implement key rotation procedures with version tracking for encrypted data</li>
     *   <li>Use environment-specific keys (separate keys for dev/test/prod)</li>
     *   <li>Monitor and audit key usage and access to detect potential security incidents</li>
     * </ul>
     * </p>
     * 
     * @param secretKeyString The secret key string from application properties
     */
    public PasswordEncryptor(@Value("${keybastion.encryption.key:defaultSecretKeyThatShouldBeChanged}") String secretKeyString) {
        // Ensure the key is exactly 32 bytes (256 bits) for AES-256
        byte[] keyBytes = new byte[32];
        byte[] originalKeyBytes = secretKeyString.getBytes(StandardCharsets.UTF_8);
        
        // Copy the original key bytes, padding or truncating as necessary
        System.arraycopy(
            originalKeyBytes, 0, 
            keyBytes, 0, 
            Math.min(originalKeyBytes.length, keyBytes.length)
        );
        
        this.secretKey = new SecretKeySpec(keyBytes, ALGORITHM);
    }

    /**
     * Encrypts a password using AES-256 encryption.
     * <p>
     * This method takes a plaintext password and encrypts it using the configured encryption key.
     * The resulting encrypted data is Base64-encoded for safe storage in text-based fields.
     * </p>
     * <p>
     * Security considerations:
     * <ul>
     *   <li>This method does not implement salt or initialization vectors, making it suitable
     *       for password storage but not for all cryptographic purposes</li>
     *   <li>The encryption is deterministic, meaning the same password will always produce
     *       the same encrypted result with the same key</li>
     *   <li>Exceptions are wrapped in RuntimeException to prevent information disclosure
     *       about the encryption process</li>
     * </ul>
     * </p>
     * 
     * @param password The plaintext password to encrypt
     * @return The encrypted password as a Base64-encoded string
     * @throws RuntimeException if any cryptographic errors occur during encryption
     */
    public String encrypt(String password) {
        try {
            Cipher cipher = Cipher.getInstance(ALGORITHM);
            cipher.init(Cipher.ENCRYPT_MODE, secretKey);
            byte[] encryptedBytes = cipher.doFinal(password.getBytes(StandardCharsets.UTF_8));
            return Base64.getEncoder().encodeToString(encryptedBytes);
        } catch (NoSuchAlgorithmException | NoSuchPaddingException | InvalidKeyException | 
                 IllegalBlockSizeException | BadPaddingException e) {
            throw new RuntimeException("Error encrypting password", e);
        }
    }

    /**
     * Decrypts an encrypted password to retrieve the original plaintext.
     * <p>
     * This method takes a Base64-encoded encrypted password string and decrypts it using
     * the configured encryption key. This operation is typically performed just before
     * displaying a password to an authenticated user who has verified their PIN.
     * </p>
     * <p>
     * Security considerations:
     * <ul>
     *   <li>This method should only be called after proper authentication and authorization</li>
     *   <li>The decrypted password should never be logged or persisted back to storage</li>
     *   <li>The method handles all cryptographic exceptions internally to prevent
     *       information disclosure about the decryption process</li>
     * </ul>
     * </p>
     * 
     * @param encryptedPassword The encrypted password as a Base64-encoded string
     * @return The original plaintext password
     * @throws RuntimeException if any cryptographic errors occur during decryption
     */
    public String decrypt(String encryptedPassword) {
        try {
            Cipher cipher = Cipher.getInstance(ALGORITHM);
            cipher.init(Cipher.DECRYPT_MODE, secretKey);
            byte[] decodedBytes = Base64.getDecoder().decode(encryptedPassword);
            byte[] decryptedBytes = cipher.doFinal(decodedBytes);
            return new String(decryptedBytes, StandardCharsets.UTF_8);
        } catch (NoSuchAlgorithmException | NoSuchPaddingException | InvalidKeyException | 
                 IllegalBlockSizeException | BadPaddingException e) {
            throw new RuntimeException("Error decrypting password", e);
        }
    }
}
