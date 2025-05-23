package com.jvp.KeyBastion_backend.repositories;

import com.jvp.KeyBastion_backend.model.UserSettings;
import com.jvp.KeyBastion_backend.model.User;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface UserSettingsRepository extends JpaRepository<UserSettings, UUID> {

    Optional<UserSettings> findByUser(User user);
}
