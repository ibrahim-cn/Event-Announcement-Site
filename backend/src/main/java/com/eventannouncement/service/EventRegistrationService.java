package com.eventannouncement.service;

import com.eventannouncement.model.AppUser;
import com.eventannouncement.model.Event;
import com.eventannouncement.model.EventRegistration;
import com.eventannouncement.repository.AppUserRepository;
import com.eventannouncement.repository.EventRegistrationRepository;
import com.eventannouncement.repository.EventRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class EventRegistrationService {

    private final EventRegistrationRepository eventRegistrationRepository;
    private final EventRepository eventRepository;
    private final AppUserRepository appUserRepository;

    public EventRegistrationService(
            EventRegistrationRepository eventRegistrationRepository,
            EventRepository eventRepository,
            AppUserRepository appUserRepository) {
        this.eventRegistrationRepository = eventRegistrationRepository;
        this.eventRepository = eventRepository;
        this.appUserRepository = appUserRepository;
    }

    @Transactional
    public void register(String userEmail, Long eventId) {
        String email = userEmail == null ? "" : userEmail.trim().toLowerCase();
        AppUser user = appUserRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found."));

        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Event not found."));

        if (event.getAppUserId() != null && event.getAppUserId().equals(user.getId())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Organizer cannot register for own event.");
        }

        if (eventRegistrationRepository.existsByEventIdAndAppUserId(eventId, user.getId())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Already registered for this event.");
        }

        EventRegistration reg = new EventRegistration();
        reg.setEventId(event.getId());
        reg.setAppUserId(user.getId());
        eventRegistrationRepository.save(reg);
    }
}
