package com.jvp.KeyBastion_backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

public class AdminDTO {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AdminUserCreationRequest {
        private String username;
        private String email;
        private String password;
        private String role;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CategoryStatsResponse {
        private String categoryName;
        private Long passwordCount;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SharingStatsResponse {
        private String categoryName;
        private Long shareCount;
    }
}
