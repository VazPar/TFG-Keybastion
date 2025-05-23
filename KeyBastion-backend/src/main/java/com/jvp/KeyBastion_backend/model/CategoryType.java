package com.jvp.KeyBastion_backend.model;

/**
 * Predefined category types for password credentials
 */
public enum CategoryType {
    BANKING("Banking"),
    SOCIAL_MEDIA("Social Media"),
    EMAIL("Email"),
    SHOPPING("Shopping"),
    ENTERTAINMENT("Entertainment"),
    WORK("Work"),
    EDUCATION("Education"),
    GAMING("Gaming"),
    FINANCE("Finance"),
    TRAVEL("Travel"),
    HEALTH("Health"),
    OTHER("Other");

    private final String displayName;

    CategoryType(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}
