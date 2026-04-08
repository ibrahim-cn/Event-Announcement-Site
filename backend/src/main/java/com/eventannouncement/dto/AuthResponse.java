package com.eventannouncement.dto;

public record AuthResponse(
        String token,
        Long userId,
        String username,
        String email
) {}
