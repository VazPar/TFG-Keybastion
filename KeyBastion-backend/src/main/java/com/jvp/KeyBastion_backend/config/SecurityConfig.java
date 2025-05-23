package com.jvp.KeyBastion_backend.config;

import java.util.Arrays;
import java.util.UUID;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.ProviderManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.Customizer;
// ContentTypeOptionsConfig is imported but not used directly with the current Customizer pattern
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusJwtEncoder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.oauth2.server.resource.authentication.JwtGrantedAuthoritiesConverter;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.header.writers.ReferrerPolicyHeaderWriter.ReferrerPolicy;
import org.springframework.security.web.header.writers.XXssProtectionHeaderWriter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import com.jvp.KeyBastion_backend.services.JpaUserDetailsService;
import com.nimbusds.jose.jwk.JWK;
import com.nimbusds.jose.jwk.JWKSet;
import com.nimbusds.jose.jwk.RSAKey;
import com.nimbusds.jose.jwk.source.ImmutableJWKSet;
import com.nimbusds.jose.jwk.source.JWKSource;
import com.nimbusds.jose.proc.SecurityContext;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * Core security configuration for the KeyBastion password management application.
 * <p>
 * This class implements KeyBastion's security architecture and enforces security policies through
 * Spring Security. It configures security features including:
 * <ul>
 *   <li>JWT-based authentication with RSA key pair for token signing/verification</li>
 *   <li>Stateless session management to prevent session fixation attacks</li>
 *   <li>Role-based access control for administrative functions</li>
 *   <li>Content Security Policy to prevent XSS attacks</li>
 *   <li>CORS configuration to protect against cross-origin attacks</li>
 *   <li>Password encoding using BCrypt with appropriate strength</li>
 *   <li>Protection against common web vulnerabilities</li>
 * </ul>
 * </p>
 * <p>
 * This configuration follows security best practices for a secure password management system
 * including zero-trust principles, defense in depth, and principle of least privilege.
 * </p>
 */
@Slf4j
@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final RsaKeyConfigProperties rsaKeyConfigProperties;
    private final JpaUserDetailsService userDetailsService;

    /**
     * Configures the security filter chain with comprehensive protections for the application.
     * <p>
     * This method defines the security policies for all HTTP requests to the application by:
     * <ul>
     *   <li>Enforcing authentication requirements for protected resources</li>
     *   <li>Applying role-based access control for admin endpoints</li>
     *   <li>Configuring stateless JWT-based authentication</li>
     *   <li>Implementing a strict Content Security Policy</li>
     *   <li>Applying protections against common web vulnerabilities (XSS, Clickjacking, etc.)</li>
     * </ul>
     * </p>
     * <p>
     * Security decisions and tradeoffs:
     * <ul>
     *   <li>CSRF protection is disabled as JWT tokens provide protection against CSRF attacks</li>
     *   <li>Authentication is stateless to improve scalability and security</li>
     *   <li>Admin endpoints are restricted to users with ADMIN role only</li>
     *   <li>Public endpoints are explicitly defined and limited</li>
     * </ul>
     * </p>
     * 
     * @param http The HttpSecurity to configure
     * @return The configured SecurityFilterChain
     * @throws Exception if security configuration fails
     */
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        // Security headers configuration for protecting against common web vulnerabilities
        // Each header addresses specific security concerns to create defense-in-depth
        return http
                .csrf(AbstractHttpConfigurer::disable) // CSRF protection disabled as JWT tokens provide request authentication
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .headers(headers -> headers
                        // Content Security Policy header defines approved sources of content that the browser may load
                        .contentSecurityPolicy(csp -> csp
                                .policyDirectives("default-src 'self'; " +
                                        "script-src 'self' 'unsafe-inline' 'unsafe-eval'; " +
                                        "style-src 'self' 'unsafe-inline'; " +
                                        "img-src 'self' data:; " +
                                        "font-src 'self'; " +
                                        "connect-src 'self' http://localhost:9000; " +
                                        "frame-src 'none'; " +
                                        "object-src 'none'; " +
                                        "base-uri 'self'; " +
                                        "form-action 'self'; " +
                                        "require-trusted-types-for 'script'"))
                        // Frame Options header prevents the site from being framed, protecting against clickjacking attacks
                        .frameOptions(frame -> frame.deny())
                        // X-Content-Type-Options header prevents content type sniffing attacks
                        .contentTypeOptions(Customizer.withDefaults())
                        // X-XSS-Protection header provides additional cross-site scripting protection
                        .xssProtection(xss -> xss
                                .headerValue(XXssProtectionHeaderWriter.HeaderValue.ENABLED_MODE_BLOCK))
                        // HTTP Strict Transport Security header enforces secure connections to the server
                        .httpStrictTransportSecurity(hsts -> hsts
                                .includeSubDomains(true)
                                .maxAgeInSeconds(31536000))
                        // Referrer Policy header controls how much referrer information is included with requests
                        .referrerPolicy(referrer -> referrer
                                .policy(ReferrerPolicy.SAME_ORIGIN))
                        // Permissions Policy header restricts which browser features the application can use
                        .permissionsPolicyHeader(permissions -> permissions
                                .policy("geolocation=(), camera=(), microphone=()")
                        ))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/api/auth/**", "/auth/**", "/error", "/h2-console/**")
                        .permitAll()
                        .requestMatchers("/api/admin/**")
                        .hasRole("ADMIN")
                        .anyRequest().authenticated())
                .sessionManagement(session -> session
                        .sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .oauth2ResourceServer(oauth2 -> oauth2
                        .jwt(jwt -> jwt
                                .decoder(jwtDecoder())
                                .jwtAuthenticationConverter(jwtAuthenticationConverter())
                        )
                )
                .userDetailsService(userDetailsService)
                .build();
    }

    /**
     * Configures Cross-Origin Resource Sharing (CORS) policies for the application.
     * <p>
     * This configuration implements a restricted CORS policy that:
     * <ul>
     *   <li>Limits allowed origins to specific trusted domains</li>
     *   <li>Restricts allowed HTTP methods to only those required by the application</li>
     *   <li>Limits exposed headers to only those needed for authentication</li>
     *   <li>Sets an appropriate max age to minimize preflight requests</li>
     * </ul>
     * </p>
     * <p>
     * Security note: This configuration includes development origins that should be
     * replaced with production domains in a production environment. The configuration
     * should be reviewed and tightened before deployment to production.
     * </p>
     * 
     * @return Configured CORS policy source
     */
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();

        // For development
        configuration.setAllowedOrigins(Arrays.asList(
                "http://localhost:3000", // React dev server
                "http://127.0.0.1:3000", // Alternative localhost
                "http://localhost:9000", // Backend itself (if needed)
                "http://localhost:3001", // Additional React dev server port
                "http://localhost:3002", // Additional React dev server port
                "http://localhost:3005"  // Current frontend server port
        ));

        // For production - replace with the actual domains
        // configuration.setAllowedOrigins(Arrays.asList("https://domain.com"));

        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList(
                "Authorization",
                "Content-Type",
                "X-Requested-With",
                "Accept",
                "X-XSRF-TOKEN"));
        configuration.setExposedHeaders(Arrays.asList(
                "Authorization",
                "X-XSRF-TOKEN"));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    /**
     * Creates a JWT decoder for verifying authentication tokens.
     * <p>
     * This decoder uses RSA public key cryptography to verify the signature
     * of incoming JWT tokens. It ensures that tokens have not been tampered with
     * and were genuinely issued by this application.
     * </p>
     * <p>
     * The RSA keys are loaded from application properties or environment variables
     * and should be kept secure in production environments.
     * </p>
     * 
     * @return A configured JWT decoder for token verification
     */
    @Bean
    public JwtDecoder jwtDecoder() {
        return NimbusJwtDecoder.withPublicKey(rsaKeyConfigProperties.getPublicKey())
                .build();
    }

    @Bean
    public JwtEncoder jwtEncoder() {
        JWK jwk = new RSAKey.Builder(rsaKeyConfigProperties.getPublicKey())
                .privateKey(rsaKeyConfigProperties.getPrivateKey())
                .keyID(UUID.randomUUID().toString())
                .build();
        JWKSource<SecurityContext> jwks = new ImmutableJWKSet<>(new JWKSet(jwk));
        return new NimbusJwtEncoder(jwks);
    }

    @Bean
    public AuthenticationManager authenticationManager() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
        authProvider.setUserDetailsService(userDetailsService);
        authProvider.setPasswordEncoder(passwordEncoder());
        authProvider.setHideUserNotFoundExceptions(false);
        return new ProviderManager(authProvider);
    }

    /**
     * Creates a secure password encoder for hashing user passwords.
     * <p>
     * KeyBastion uses BCrypt, a strong adaptive hashing function with built-in
     * salting, to securely hash user passwords. BCrypt automatically handles:
     * <ul>
     *   <li>Unique salt generation for each password</li>
     *   <li>Slow hashing to resist brute force attacks</li>
     *   <li>Configurable work factor to adjust security strength</li>
     * </ul>
     * </p>
     * <p>
     * The default BCrypt implementation uses an appropriate work factor that
     * balances security and performance. This provides strong protection for
     * stored passwords against various attack vectors.
     * </p>
     * 
     * @return BCryptPasswordEncoder with appropriate strength settings
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    /**
     * Configures the JWT authentication converter for extracting authorities/roles from tokens.
     * <p>
     * This converter extracts role information from JWT tokens and converts them to
     * Spring Security authorities. It performs the critical security function of mapping
     * JWT claims to application authorization decisions, ensuring that:
     * <ul>
     *   <li>Role information is properly extracted from the "roles" claim</li>
     *   <li>Roles are prefixed with "ROLE_" as required by Spring Security</li>
     *   <li>Authentication and authorization are properly connected</li>
     * </ul>
     * </p>
     * <p>
     * This configuration is essential for correctly implementing role-based access
     * control throughout the application, especially for admin functionality separation.
     * </p>
     * 
     * @return Configured JWT authentication converter
     */
    private JwtAuthenticationConverter jwtAuthenticationConverter() {
        JwtGrantedAuthoritiesConverter grantedAuthoritiesConverter = new JwtGrantedAuthoritiesConverter();
        grantedAuthoritiesConverter.setAuthorityPrefix("ROLE_"); // Add ROLE_ prefix for Spring Security
        grantedAuthoritiesConverter.setAuthoritiesClaimName("roles");

        JwtAuthenticationConverter jwtConverter = new JwtAuthenticationConverter();
        jwtConverter.setJwtGrantedAuthoritiesConverter(grantedAuthoritiesConverter);
        return jwtConverter;
    }
}
