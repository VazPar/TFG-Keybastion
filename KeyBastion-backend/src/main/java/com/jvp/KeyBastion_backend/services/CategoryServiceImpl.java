package com.jvp.KeyBastion_backend.services;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.jvp.KeyBastion_backend.model.Category;
import com.jvp.KeyBastion_backend.model.User;
import com.jvp.KeyBastion_backend.repositories.CategoryRepository;

/**
 * Implementation of CategoryService for KeyBastion.
 * <p>
 * Handles creating, updating, deleting, and retrieving categories for users and globally.
 * Uses CategoryRepository for database operations.
 */
@Service
public class CategoryServiceImpl implements CategoryService {

    @Autowired
    private CategoryRepository categoryRepository;

    /**
     * Creates a new category in the system.
     *
     * @param category The Category object to create
     * @return The created Category object
     */
    @Override
    public Category createCategory(Category category) {
        return categoryRepository.save(category);
    }

    /**
     * Finds a category by its unique ID.
     *
     * @param id UUID of the category
     * @return Optional containing the Category if found, or empty if not
     */
    @Override
    public Optional<Category> findCategoryById(UUID id) {
        return categoryRepository.findById(id);
    }

    /**
     * Retrieves all categories belonging to a specific user.
     *
     * @param user The user whose categories to retrieve
     * @return List of Category objects for the user
     */
    @Override
    public List<Category> findCategoriesByUser(User user) {
        return categoryRepository.findByUser(user);
    }

    /**
     * Finds a category by name for a specific user.
     *
     * @param name The category name
     * @param user The user who owns the category
     * @return Optional containing the Category if found, or empty if not
     */
    @Override
    public Optional<Category> findCategoryByNameAndUser(String name, User user) {
        return categoryRepository.findByNameAndUser(name, user);
    }

    /**
     * Updates an existing category's information if it exists.
     *
     * @param category The Category object with updated data
     * @return The updated Category object
     * @throws RuntimeException if the category does not exist
     */
    @Override
    public Category updateCategory(Category category) {
        if (categoryRepository.existsById(category.getId())) {
            return categoryRepository.save(category);
        }
        throw new RuntimeException("Category not found with ID: " + category.getId());
    }
    
    /**
     * Saves or updates a category in the database.
     *
     * @param category The Category object to save
     * @return The saved Category object
     */
    @Override
    public Category saveCategory(Category category) {
        return categoryRepository.save(category);
    }

    /**
     * Deletes a category by its unique ID.
     *
     * @param id UUID of the category to delete
     */
    @Override
    public void deleteCategoryById(UUID id) {
        categoryRepository.deleteById(id);
    }

    /**
     * Finds categories whose names contain the given substring.
     *
     * @param name Substring to search for in category names
     * @return List of matching Category objects
     */
    @Override
    public List<Category> findCategoriesByNameContaining(String name) {
        return categoryRepository.findByNameContaining(name);
    }
    
    /**
     * Retrieves all global (system-wide) categories.
     *
     * @return List of global Category objects
     */
    @Override
    public List<Category> findGlobalCategories() {
        return categoryRepository.findByGlobalTrue();
    }
    
    /**
     * Retrieves all categories for a user, including global categories.
     *
     * @param user The user whose categories to retrieve
     * @return List of Category objects (user and global)
     */
    @Override
    public List<Category> findCategoriesByUserOrGlobal(User user) {
        return categoryRepository.findByUserOrGlobalTrue(user);
    }
    
    /**
     * Retrieves all categories in the system (user and global).
     *
     * @return List of all Category objects
     */
    @Override
    public List<Category> findAllCategories() {
        return categoryRepository.findAll();
    }
}