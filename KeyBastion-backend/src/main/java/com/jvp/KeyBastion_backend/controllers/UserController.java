package com.jvp.KeyBastion_backend.controllers;

import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.jvp.KeyBastion_backend.model.Role;
import com.jvp.KeyBastion_backend.model.User;
import com.jvp.KeyBastion_backend.services.UserService;

@RestController
@RequestMapping("/api/users")
public class UserController extends BaseController {

    @Autowired
    private BCryptPasswordEncoder passwordEncoder;

    @Autowired
    private UserService userService;

    @PostMapping("/register")
    public ResponseEntity<User> registerUser(@RequestBody User user, Model model) {
        User registeredUser = userService.registerUser(user);
        return ResponseEntity.ok(registeredUser);
    }

    @GetMapping("/{id}")
    public ResponseEntity<User> getUserById(@PathVariable UUID id) {
        return userService.findUserById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/email/{email}")
    public ResponseEntity<User> getUserByEmail(@PathVariable String email) {
        return userService.findUserByEmail(email)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/username/{username}")
    public ResponseEntity<User> getUserByUsername(@PathVariable String name) {
        return userService.findUserByUsername(name)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/update")
    public ResponseEntity<User> updateUser(@RequestBody User user) {
        User updatedUser = userService.updateUser(user);
        return ResponseEntity.ok(updatedUser);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable UUID id) {
        userService.deleteUserById(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/all")
    public ResponseEntity<List<User>> getAllUsers() {
        List<User> users = userService.getAllUsers();
        return ResponseEntity.ok(users);
    }

    @GetMapping("/role/{role}")
    public ResponseEntity<List<User>> getUsersByRole(@PathVariable Role role) {
        List<User> users = userService.getUsersByRole(role);
        return ResponseEntity.ok(users);
    }

    @GetMapping("/me")
    public ResponseEntity<Map<String, Object>> getCurrentUserInfo() {
        User user = getCurrentUser();
        
        // Don't expose sensitive information
        Map<String, Object> userInfo = Map.of(
            "id", user.getId(),
            "username", user.getUsername(),
            "email", user.getEmail(),
            "role", user.getRole(),
            "hasSecurityPin", user.getSecurityPin() != null
        );
        
        return ResponseEntity.ok(userInfo);
    }
    
    @PostMapping("/verify-password")
    public ResponseEntity<?> verifyPassword(@RequestBody Map<String, String> request) {
        String password = request.get("password");
        if (password == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Password is required"));
        }
        
        User currentUser = getCurrentUser();
        boolean isValid = passwordEncoder.matches(password, currentUser.getPasswordHash());
        
        if (isValid) {
            return ResponseEntity.ok(Map.of("valid", true));
        } else {
            return ResponseEntity.status(401).body(Map.of("error", "Invalid password"));
        }
    }
    
    @PostMapping("/set-pin")
    public ResponseEntity<?> setSecurityPin(@RequestBody Map<String, String> request) {
        String pin = request.get("pin");
        String password = request.get("password");
        
        if (pin == null || pin.length() < 4 || pin.length() > 6) {
            return ResponseEntity.badRequest().body(Map.of("error", "PIN must be 4-6 digits"));
        }
        
        if (password == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Password is required"));
        }
        
        User currentUser = getCurrentUser();
        
        // Verify password first
        if (!passwordEncoder.matches(password, currentUser.getPasswordHash())) {
            return ResponseEntity.status(401).body(Map.of("error", "Invalid password"));
        }
        
        // Set the PIN (in a real app, you would encrypt/hash the PIN)
        currentUser.setSecurityPin(pin);
        userService.updateUser(currentUser);
        
        return ResponseEntity.ok(Map.of("message", "Security PIN set successfully"));
    }
    
    @GetMapping("/has-pin")
    public ResponseEntity<?> hasSecurityPin() {
        User currentUser = getCurrentUser();
        boolean hasPin = currentUser.getSecurityPin() != null;
        
        return ResponseEntity.ok(Map.of("hasPin", hasPin));
    }
}
