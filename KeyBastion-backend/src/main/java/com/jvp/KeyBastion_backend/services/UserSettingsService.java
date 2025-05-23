package com.jvp.KeyBastion_backend.services;

import com.jvp.KeyBastion_backend.model.User;
import com.jvp.KeyBastion_backend.model.UserSettings;
import java.util.Optional;

public interface UserSettingsService {

    UserSettings saveUserSettings(UserSettings userSettings);

    Optional<UserSettings> findUserSettingsByUser(User user);

    boolean isTwoFactorAuthEnabled(User user);
}
