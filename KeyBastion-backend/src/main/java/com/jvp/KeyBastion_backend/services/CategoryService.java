package com.jvp.KeyBastion_backend.services;

import com.jvp.KeyBastion_backend.model.Category;
import com.jvp.KeyBastion_backend.model.User;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * CategoryService defines operations for managing credential categories in KeyBastion.
 * <p>
 * Provides methods for creating, updating, deleting, and retrieving categories (user and global).
 */
public interface CategoryService {

    /**
     * Creates a new category in the system.
     *
     * @param category The Category object to create
     * @return The created Category object
     */
    Category createCategory(Category category);
    
    /**
     * Saves or updates a category in the database.
     *
     * @param category The Category object to save
     * @return The saved Category object
     */
    Category saveCategory(Category category);

    /**
     * Finds a category by its unique ID.
     *
     * @param id UUID of the category
     * @return Optional containing the Category if found, or empty if not
     */
    Optional<Category> findCategoryById(UUID id);

    /**
     * Retrieves all categories belonging to a specific user.
     *
     * @param user The user whose categories to retrieve
     * @return List of Category objects for the user
     */
    List<Category> findCategoriesByUser(User user);

    /**
     * Finds a category by name for a specific user.
     *
     * @param name The category name
     * @param user The user who owns the category
     * @return Optional containing the Category if found, or empty if not
     */
    Optional<Category> findCategoryByNameAndUser(String name, User user);

    /**
     * Updates an existing category's information.
     *
     * @param category The Category object with updated data
     * @return The updated Category object
     */
    Category updateCategory(Category category);

    /**
     * Deletes a category by its unique ID.
     *
     * @param id UUID of the category to delete
     */
    void deleteCategoryById(UUID id);

    /**
     * Finds categories whose names contain the given substring.
     *
     * @param name Substring to search for in category names
     * @return List of matching Category objects
     */
    List<Category> findCategoriesByNameContaining(String name);
    
    /**
     * Retrieves all global (system-wide) categories.
     *
     * @return List of global Category objects
     */
    List<Category> findGlobalCategories();
    
    /**
     * Retrieves all categories for a user, including global categories.
     *
     * @param user The user whose categories to retrieve
     * @return List of Category objects (user and global)
     */
    List<Category> findCategoriesByUserOrGlobal(User user);
    
    /**
     * Retrieves all categories in the system (user and global).
     *
     * @return List of all Category objects
     */
    List<Category> findAllCategories();
}
