package com.jvp.KeyBastion_backend.services;

import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.jvp.KeyBastion_backend.auth.AuthUser;
import com.jvp.KeyBastion_backend.repositories.UserRepository;

@Service
public class JpaUserDetailsServiceImpl implements JpaUserDetailsService {

    @Autowired
    private UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        AuthUser user = userRepository
                .findByUsername(username)
                .map(AuthUser::new)
                .orElseThrow(() -> new UsernameNotFoundException("User name not found: " + username));

        return user;

    }

    @Override
    @Transactional(readOnly = true)
    public Optional<UserDetails> findUserByUsername(String username) {
        return userRepository.findByUsername(username)
                .map(AuthUser::new);
    }

    @Override
    @Transactional(readOnly = true)
    public boolean userExists(String username) {
        return userRepository.existsByUsername(username);
    }
}
