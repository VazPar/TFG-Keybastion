package com.jvp.KeyBastion_backend;

import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import com.jvp.KeyBastion_backend.config.RsaKeyConfigProperties;
import com.jvp.KeyBastion_backend.model.Role;
import com.jvp.KeyBastion_backend.model.User;
import com.jvp.KeyBastion_backend.repositories.UserRepository;

/**
 * Main application class for KeyBastion password manager backend.
 * This class initializes the Spring Boot application and sets up necessary configurations.
 * It also creates a default admin user if one doesn't already exist in the database.
 */
@EnableConfigurationProperties(RsaKeyConfigProperties.class)
@SpringBootApplication
public class KeyBastionBackendApplication {

    /**
     * Main entry point for the application.
     * 
     * @param args Command line arguments passed to the application
     */
    public static void main(String[] args) {
        SpringApplication.run(KeyBastionBackendApplication.class, args);
    }

    /**
     * Initializes a default admin user in the database if one doesn't already exist.
     * This ensures that there's always at least one admin account available for initial login.
     * 
     * @param userRepository Repository for user data access
     * @param passwordEncoder Password encoder for securely hashing the user password
     * @return A CommandLineRunner that creates the default user on application startup
     */
    @Bean
    public CommandLineRunner initializeUser(UserRepository userRepository, BCryptPasswordEncoder passwordEncoder) {
        return args -> {
            // Check if the default user already exists
            if (!userRepository.existsByEmail("example@gmail.com")) {
                User user = new User();
                user.setUsername("exampleuser");
                user.setEmail("example@gmail.com");
                user.setRole(Role.ADMIN);
                user.setPasswordHash(passwordEncoder.encode("examplepassword"));

                // Save the user to the database
                userRepository.save(user);
                System.out.println("Default admin user created successfully.");
            } else {
                System.out.println("Default admin user already exists, skipping creation.");
            }
        };
    }
}
