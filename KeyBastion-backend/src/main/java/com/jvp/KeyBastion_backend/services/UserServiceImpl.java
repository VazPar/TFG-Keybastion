package com.jvp.KeyBastion_backend.services;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.jvp.KeyBastion_backend.model.Role;
import com.jvp.KeyBastion_backend.model.User;
import com.jvp.KeyBastion_backend.repositories.UserRepository;

/**
 * Implementation of UserService for KeyBastion.
 * <p>
 * Handles user registration, lookup, update, deletion, and role-based queries.
 * Uses UserRepository for database operations and PasswordEncoder for secure password storage.
 */
@Service
public class UserServiceImpl implements UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    /**
     * Registers a new user, securely hashing their password before saving.
     *
     * @param user The User object to register
     * @return The registered User object
     */
    @Override
    public User registerUser(User user) {
        user.setPasswordHash(passwordEncoder.encode(user.getPasswordHash()));
        return userRepository.save(user);
    }

    /**
     * Finds a user by their unique ID.
     *
     * @param id UUID of the user
     * @return Optional containing the User if found, or empty if not
     */
    @Override
    public Optional<User> findUserById(UUID id) {
        return userRepository.findById(id);
    }

    /**
     * Finds a user by their email address.
     *
     * @param email The user's email
     * @return Optional containing the User if found, or empty if not
     */
    @Override
    public Optional<User> findUserByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    /**
     * Finds a user by their username.
     *
     * @param username The user's username
     * @return Optional containing the User if found, or empty if not
     */
    @Override
    public Optional<User> findUserByUsername(String username) {
        return userRepository.findByUsername(username);
    }

    /**
     * Checks if a user exists with the given email address.
     *
     * @param email The email to check
     * @return true if a user exists with the email, false otherwise
     */
    @Override
    public boolean existsByEmail(String email) {
        return userRepository.existsByEmail(email);
    }

    /**
     * Checks if a user exists with the given username.
     *
     * @param username The username to check
     * @return true if a user exists with the username, false otherwise
     */
    @Override
    public boolean existsByUsername(String username) {
        return userRepository.existsByUsername(username);
    }

    /**
     * Updates an existing user's information if they exist.
     *
     * @param user The User object with updated information
     * @return The updated User object
     * @throws RuntimeException if the user does not exist
     */
    @Override
    public User updateUser(User user) {
        if (userRepository.existsById(user.getId())) {
            return userRepository.save(user);
        }
        throw new RuntimeException("User not found with ID: " + user.getId());
    }

    /**
     * Deletes a user by their unique ID.
     *
     * @param id UUID of the user to delete
     */
    @Override
    public void deleteUserById(UUID id) {
        userRepository.deleteById(id);
    }

    /**
     * Retrieves all users in the system.
     *
     * @return List of all User objects
     */
    @Override
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    /**
     * Retrieves all users with a specific role (e.g., ADMIN, USER).
     *
     * @param role The user role to filter by
     * @return List of User objects with the given role
     */
    @Override
    public List<User> getUsersByRole(Role role) {
        return userRepository.findByRole(role);
    }
}
