package com.jvp.KeyBastion_backend.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import com.jvp.KeyBastion_backend.model.Role;
import com.jvp.KeyBastion_backend.model.User;
import com.jvp.KeyBastion_backend.services.UserService;

import jakarta.servlet.http.HttpServletRequest;

/**
 * Base controller that provides common functionality for all controllers.
 */
public abstract class BaseController {

    @Autowired
    protected UserService userService;

    /**
     * Gets the current authenticated user.
     *
     * @return the authenticated user
     * @throws RuntimeException if the user is not found
     */
    protected User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        return userService.findUserByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    /**
     * Checks if the current user has the specified role.
     *
     * @param role the role to check
     * @return true if the user has the role, false otherwise
     */
    protected boolean hasRole(Role role) {
        User user = getCurrentUser();
        return user.getRole() == role;
    }

    /**
     * Gets the client IP address from the current request.
     *
     * @return the client IP address
     */
    protected String getClientIp() {
        try {
            HttpServletRequest request = ((ServletRequestAttributes) RequestContextHolder.currentRequestAttributes())
                    .getRequest();
            String ipAddress = request.getHeader("X-Forwarded-For");
            if (ipAddress == null || ipAddress.isEmpty() || "unknown".equalsIgnoreCase(ipAddress)) {
                ipAddress = request.getHeader("Proxy-Client-IP");
            }
            if (ipAddress == null || ipAddress.isEmpty() || "unknown".equalsIgnoreCase(ipAddress)) {
                ipAddress = request.getHeader("WL-Proxy-Client-IP");
            }
            if (ipAddress == null || ipAddress.isEmpty() || "unknown".equalsIgnoreCase(ipAddress)) {
                ipAddress = request.getRemoteAddr();
            }

            // For local debugging, if IP is 0:0:0:0:0:0:0:1, replace with 127.0.0.1
            if ("0:0:0:0:0:0:0:1".equals(ipAddress)) {
                ipAddress = "127.0.0.1";
            }

            return ipAddress;
        } catch (Exception e) {
            return "unknown";
        }
    }
}
