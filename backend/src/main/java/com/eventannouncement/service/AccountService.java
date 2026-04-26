package com.eventannouncement.service;

import com.eventannouncement.model.AppUser;
import com.eventannouncement.model.Event;
import com.eventannouncement.repository.AppUserRepository;
import com.eventannouncement.repository.EventRegistrationRepository;
import com.eventannouncement.repository.EventRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class AccountService {

    private final AppUserRepository appUserRepository;
    private final EventRepository eventRepository;
    private final EventRegistrationRepository eventRegistrationRepository;
    private final EventService eventService;

    public AccountService(
            AppUserRepository appUserRepository,
            EventRepository eventRepository,
            EventRegistrationRepository eventRegistrationRepository,
            EventService eventService) {
        this.appUserRepository = appUserRepository;
        this.eventRepository = eventRepository;
        this.eventRegistrationRepository = eventRegistrationRepository;
        this.eventService = eventService;
    }

    public AppUser getCurrentUser(String email) {
        String normalized = email == null ? "" : email.trim().toLowerCase();
        return appUserRepository.findByEmailIgnoreCase(normalized)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found."));
    }

    @Transactional
    public void updateProfileImage(String email, String imageUrl) {
        AppUser user = getCurrentUser(email);
        user.setProfileImageUrl(imageUrl == null ? "" : imageUrl.trim());
        appUserRepository.save(user);
    }

    @Transactional
    public void deleteCurrentUser(String email) {
        AppUser user = getCurrentUser(email);

        // Remove user's event registrations (as participant).
        eventRegistrationRepository.deleteAllByAppUserId(user.getId());

        // Remove events created by user (and their registrations).
        List<Event> myEvents = eventRepository.findAllByAppUserId(user.getId());
        for (Event event : myEvents) {
            eventService.delete(event);
        }

        appUserRepository.delete(user);
    }
}
