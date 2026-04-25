package com.eventannouncement.dto;

public record EventRegistrantContactDto(
        Long userId,
        String username,
        String email,
        String phone
) {
}
