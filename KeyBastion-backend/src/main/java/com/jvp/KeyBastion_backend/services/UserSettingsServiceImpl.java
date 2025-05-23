package com.jvp.KeyBastion_backend.services;

import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.jvp.KeyBastion_backend.model.User;
import com.jvp.KeyBastion_backend.model.UserSettings;
import com.jvp.KeyBastion_backend.repositories.UserSettingsRepository;

@Service
public class UserSettingsServiceImpl implements UserSettingsService {

    @Autowired
    private UserSettingsRepository userSettingsRepository;

    @Override
    public UserSettings saveUserSettings(UserSettings userSettings) {
        return userSettingsRepository.save(userSettings);
    }

    @Override
    public Optional<UserSettings> findUserSettingsByUser(User user) {
        return userSettingsRepository.findByUser(user);
    }

    @Override
    public boolean isTwoFactorAuthEnabled(User user) {
        Optional<UserSettings> userSettings = userSettingsRepository.findByUser(user);
        return userSettings.isPresent() && userSettings.get().isTwoFactorAuthEnabled();
    }
}