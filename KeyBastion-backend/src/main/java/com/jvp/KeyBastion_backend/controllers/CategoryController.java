package com.jvp.KeyBastion_backend.controllers;

import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.jvp.KeyBastion_backend.model.Category;
import com.jvp.KeyBastion_backend.model.CategoryType;
import com.jvp.KeyBastion_backend.model.Role;
import com.jvp.KeyBastion_backend.model.User;
import com.jvp.KeyBastion_backend.repositories.UserRepository;
import com.jvp.KeyBastion_backend.services.CategoryService;

@RestController
@RequestMapping("/api/categories")
public class CategoryController {

    @Autowired
    private CategoryService categoryService;
    
    @Autowired
    private UserRepository userRepository;
    
    /**
     * Get the current authenticated user
     */
    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
    
    /**
     * Get all categories for the current user
     */
    @GetMapping
    public ResponseEntity<List<Category>> getUserCategories() {
        User currentUser = getCurrentUser();
        // Get both user categories and global categories
        List<Category> categories = categoryService.findCategoriesByUserOrGlobal(currentUser);
        return ResponseEntity.ok(categories);
    }
    
    /**
     * Create a new category
     */
    @PostMapping
    public ResponseEntity<Category> createCategory(@RequestBody Category category) {
        User currentUser = getCurrentUser();
        
        // Only admins can create global categories
        if (category.isGlobal() && currentUser.getRole() != Role.ADMIN) {
            return ResponseEntity.status(403).build();
        }
        
        category.setUser(currentUser);
        Category savedCategory = categoryService.saveCategory(category);
        return ResponseEntity.ok(savedCategory);
    }
    
    /**
     * Get all predefined category types
     */
    @GetMapping("/types")
    public ResponseEntity<List<Map<String, String>>> getCategoryTypes() {
        List<Map<String, String>> categoryTypes = Arrays.stream(CategoryType.values())
                .map(type -> Map.of(
                        "value", type.name(),
                        "label", type.getDisplayName()))
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(categoryTypes);
    }
    
    /**
     * Get a category by ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<Category> getCategoryById(@PathVariable UUID id) {
        User currentUser = getCurrentUser();
        return categoryService.findCategoryById(id)
                .filter(category -> category.getUser().getId().equals(currentUser.getId()))
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    
    /**
     * Create a category from a category type
     */
    @PostMapping("/from-type")
    public ResponseEntity<Category> createCategoryFromType(@RequestBody Map<String, String> request) {
        User currentUser = getCurrentUser();
        
        String typeStr = request.get("categoryType");
        String name = request.get("name");
        String description = request.get("description");
        
        if (typeStr == null || name == null) {
            return ResponseEntity.badRequest().build();
        }
        
        try {
            CategoryType categoryType = CategoryType.valueOf(typeStr);
            
            Category category = new Category();
            category.setName(name);
            category.setDescription(description);
            category.setCategoryType(categoryType);
            category.setUser(currentUser);
            
            Category savedCategory = categoryService.saveCategory(category);
            return ResponseEntity.ok(savedCategory);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }
}
