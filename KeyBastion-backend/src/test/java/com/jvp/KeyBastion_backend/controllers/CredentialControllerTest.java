package com.jvp.KeyBastion_backend.controllers;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.spy;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;
import org.springframework.http.MediaType;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.jvp.KeyBastion_backend.dto.SaveCredentialRequest;
import com.jvp.KeyBastion_backend.model.Credential;
import com.jvp.KeyBastion_backend.model.Role;
import com.jvp.KeyBastion_backend.model.User;
import com.jvp.KeyBastion_backend.services.ActivityLogService;
import com.jvp.KeyBastion_backend.services.CategoryService;
import com.jvp.KeyBastion_backend.services.CredentialService;
import com.jvp.KeyBastion_backend.services.UserService;
import com.jvp.KeyBastion_backend.util.PasswordEncryptor;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
public class CredentialControllerTest {
    
    private MockMvc mockMvc;

    private ObjectMapper objectMapper = new ObjectMapper();

    @Mock
    private CredentialService credentialService;

    @Mock
    private UserService userService;

    @Mock
    private CategoryService categoryService;

    @Mock
    private ActivityLogService activityLogService;

    @Mock
    private PasswordEncryptor passwordEncryptor;

    @InjectMocks
    private CredentialController credentialController;

    private User testUser;
    private Credential testCredential;
    private SaveCredentialRequest testRequest;

    @BeforeEach
    void setUp() {
        // Set up test user
        testUser = new User();
        testUser.setId(UUID.randomUUID());
        testUser.setUsername("testuser");
        testUser.setEmail("test@example.com");
        testUser.setRole(Role.USER);

        // Set up test credential
        testCredential = new Credential();
        testCredential.setId(UUID.randomUUID());
        testCredential.setAccountName("Test Account");
        testCredential.setEncryptedPassword("encryptedPassword123");
        testCredential.setServiceUrl("https://example.com");
        testCredential.setNotes("Test notes");
        testCredential.setCreatedAt(LocalDateTime.now());
        testCredential.setUser(testUser);
        testCredential.setPasswordLength(16);
        testCredential.setIncludeLowercase(true);
        testCredential.setIncludeUppercase(true);
        testCredential.setIncludeNumbers(true);
        testCredential.setIncludeSpecial(true);
        testCredential.setPasswordStrength(85);

        // Set up test request
        testRequest = new SaveCredentialRequest();
        testRequest.setAccountName("Test Account");
        testRequest.setPassword("password123");
        testRequest.setServiceUrl("https://example.com");
        testRequest.setNotes("Test notes");
        testRequest.setPasswordLength(16);
        testRequest.setIncludeLowercase(true);
        testRequest.setIncludeUppercase(true);
        testRequest.setIncludeNumbers(true);
        testRequest.setIncludeSpecial(true);
        testRequest.setPasswordStrength(85);

        // Mock security context
        Authentication authentication = mock(Authentication.class);
        SecurityContext securityContext = mock(SecurityContext.class);
        when(securityContext.getAuthentication()).thenReturn(authentication);
        when(authentication.getName()).thenReturn("testuser");
        SecurityContextHolder.setContext(securityContext);
        
        // Configure service mocks
        when(userService.findUserByUsername(anyString())).thenReturn(Optional.of(testUser));
        when(passwordEncryptor.encrypt(any(String.class))).thenReturn("encryptedPassword123");
        when(credentialService.createCredential(any(Credential.class), any())).thenReturn(testCredential);
        when(activityLogService.createAndLogActivity(
            any(User.class),
            anyString(),
            anyString(),
            anyString()
        )).thenReturn(null);
        
        // Set up controller spy and MockMvc
        credentialController = spy(credentialController);
        doNothing().when(credentialController).checkUserRole();
        mockMvc = MockMvcBuilders.standaloneSetup(credentialController).build();
    }

    @Test
    void testCreateCredential() throws Exception {
        mockMvc.perform(post("/api/credentials")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(testRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accountName").value("Test Account"))
                .andExpect(jsonPath("$.encryptedPassword").value("[PROTECTED]"))
                .andExpect(jsonPath("$.serviceUrl").value("https://example.com"))
                .andExpect(jsonPath("$.notes").value("Test notes"))
                .andExpect(jsonPath("$.passwordLength").value(16))
                .andExpect(jsonPath("$.includeLowercase").value(true))
                .andExpect(jsonPath("$.includeUppercase").value(true))
                .andExpect(jsonPath("$.includeNumbers").value(true))
                .andExpect(jsonPath("$.includeSpecial").value(true))
                .andExpect(jsonPath("$.passwordStrength").value(85));
    }
}