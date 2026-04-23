package com.eventannouncement.service;

import com.eventannouncement.dto.AuthResponse;
import com.eventannouncement.dto.LoginRequest;
import com.eventannouncement.dto.RegisterRequest;
import com.eventannouncement.model.AppUser;
import com.eventannouncement.repository.AppUserRepository;
import com.eventannouncement.security.JwtService;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class AuthService {

    private final AppUserRepository appUserRepository;
    private final JwtService jwtService;

    public AuthService(AppUserRepository appUserRepository, JwtService jwtService) {
        this.appUserRepository = appUserRepository;
        this.jwtService = jwtService;
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        String email = normalizeEmail(request.email());
        if (appUserRepository.findByEmailIgnoreCase(email).isPresent()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "This email is already registered.");
        }

        AppUser user = new AppUser();
        user.setUsername(request.username().trim());
        user.setEmail(email);
        user.setPassword(request.password());
        appUserRepository.save(user);

        String token = jwtService.generateToken(user.getEmail());
        return new AuthResponse(token, user.getId(), user.getUsername(), user.getEmail());
    }

    public AuthResponse login(LoginRequest request) {
        String email = normalizeEmail(request.email());
        AppUser user = appUserRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid email or password."));

        String stored = user.getPassword() == null ? "" : user.getPassword();
        if (!stored.equals(request.password())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid email or password.");
        }

        String token = jwtService.generateToken(user.getEmail());
        return new AuthResponse(token, user.getId(), user.getUsername(), user.getEmail());
    }

    private static String normalizeEmail(String email) {
        return email == null ? "" : email.trim().toLowerCase();
    }
}
