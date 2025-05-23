package com.jvp.KeyBastion_backend.repositories;

import com.jvp.KeyBastion_backend.model.User;
import com.jvp.KeyBastion_backend.model.Category;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface CategoryRepository extends JpaRepository<Category, UUID> {

    List<Category> findByUser(User user);

    Optional<Category> findByNameAndUser(String name, User user);

    List<Category> findByNameContaining(String name);
    
    List<Category> findByGlobalTrue();
    
    List<Category> findByUserOrGlobalTrue(User user);

    @Query("SELECT COUNT(c) FROM Credential c WHERE c.category = :category")
    long countByCategory(@Param("category") Category category);
}
