package com.eventannouncement.service;

import com.eventannouncement.dto.EventRegistrantContactDto;
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

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

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

    @Transactional
    public void unregister(String userEmail, Long eventId) {
        String email = userEmail == null ? "" : userEmail.trim().toLowerCase();
        AppUser user = appUserRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found."));

        EventRegistration registration = eventRegistrationRepository.findByEventIdAndAppUserId(eventId, user.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "You are not registered for this event."));

        eventRegistrationRepository.delete(registration);
    }

    public List<Long> getRegisteredEventIds(String userEmail) {
        String email = userEmail == null ? "" : userEmail.trim().toLowerCase();
        AppUser user = appUserRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found."));

        return eventRegistrationRepository.findAllByAppUserId(user.getId())
                .stream()
                .map(EventRegistration::getEventId)
                .toList();
    }

    public List<EventRegistrantContactDto> getRegistrantContactsForOwner(String ownerEmail, Long eventId) {
        String email = ownerEmail == null ? "" : ownerEmail.trim().toLowerCase();
        AppUser owner = appUserRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found."));

        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Event not found."));

        if (event.getAppUserId() == null || !event.getAppUserId().equals(owner.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only the organizer can view registrant contacts.");
        }

        List<EventRegistration> registrations = eventRegistrationRepository.findAllByEventId(eventId);
        if (registrations.isEmpty()) return List.of();

        Set<Long> userIds = registrations.stream().map(EventRegistration::getAppUserId).collect(Collectors.toSet());
        Map<Long, AppUser> usersById = new HashMap<>();
        appUserRepository.findAllById(userIds).forEach((u) -> usersById.put(u.getId(), u));

        return registrations.stream()
                .map(r -> usersById.get(r.getAppUserId()))
                .filter(u -> u != null)
                .map(u -> new EventRegistrantContactDto(u.getId(), u.getUsername(), u.getEmail(), u.getPhone()))
                .toList();
    }

    @Transactional
    public void cancelRegistrantByOwner(String ownerEmail, Long eventId, Long registrantUserId) {
        String email = ownerEmail == null ? "" : ownerEmail.trim().toLowerCase();
        AppUser owner = appUserRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found."));

        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Event not found."));

        if (event.getAppUserId() == null || !event.getAppUserId().equals(owner.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only the organizer can cancel registrations.");
        }

        EventRegistration registration = eventRegistrationRepository.findByEventIdAndAppUserId(eventId, registrantUserId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Registrant not found for this event."));

        eventRegistrationRepository.delete(registration);
    }
}
