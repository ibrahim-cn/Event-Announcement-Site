package com.eventannouncement.controller;

import com.eventannouncement.dto.EventRegistrantContactDto;
import com.eventannouncement.model.AppUser;
import com.eventannouncement.model.Event;
import com.eventannouncement.repository.AppUserRepository;
import com.eventannouncement.service.EventRegistrationService;
import com.eventannouncement.service.EventService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

// C# karsiligi: WebApi/Controllers/Concrete/EventsController.cs
@RestController
@RequestMapping("/api/events")
public class EventsController {

    private final EventService eventService;
    private final EventRegistrationService eventRegistrationService;
    private final AppUserRepository appUserRepository;

    public EventsController(
            EventService eventService,
            EventRegistrationService eventRegistrationService,
            AppUserRepository appUserRepository) {
        this.eventService = eventService;
        this.eventRegistrationService = eventRegistrationService;
        this.appUserRepository = appUserRepository;
    }

    // GET /api/events
    @GetMapping
    public ResponseEntity<List<Event>> eventList() {
        var values = eventService.getList();
        return ResponseEntity.ok(values);
    }

    // POST /api/events — only authenticated members; organizer = current user
    @PostMapping
    public ResponseEntity<String> createEvent(@RequestBody Event event, Authentication authentication) {
        AppUser user = appUserRepository.findByEmailIgnoreCase(authentication.getName())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found."));
        event.setAppUserId(user.getId());
        eventService.insert(event);
        return ResponseEntity.ok("Event created successfully");
    }

    // POST /api/events/{eventId}/registrations — only authenticated members
    @PostMapping("/{eventId}/registrations")
    public ResponseEntity<String> registerForEvent(
            @PathVariable Long eventId,
            Authentication authentication) {
        eventRegistrationService.register(authentication.getName(), eventId);
        return ResponseEntity.status(HttpStatus.CREATED).body("Registered for event");
    }

    // DELETE /api/events/{eventId}/registrations — cancel own registration
    @DeleteMapping("/{eventId}/registrations")
    public ResponseEntity<String> unregisterFromEvent(
            @PathVariable Long eventId,
            Authentication authentication) {
        eventRegistrationService.unregister(authentication.getName(), eventId);
        return ResponseEntity.ok("Registration cancelled");
    }

    // GET /api/events/registrations/me — event ids I registered
    @GetMapping("/registrations/me")
    public ResponseEntity<List<Long>> myRegisteredEventIds(Authentication authentication) {
        return ResponseEntity.ok(eventRegistrationService.getRegisteredEventIds(authentication.getName()));
    }

    // GET /api/events/{eventId}/registrations — organizer can view contact info of registrants
    @GetMapping("/{eventId}/registrations")
    public ResponseEntity<List<EventRegistrantContactDto>> eventRegistrantContacts(
            @PathVariable Long eventId,
            Authentication authentication) {
        return ResponseEntity.ok(eventRegistrationService.getRegistrantContactsForOwner(authentication.getName(), eventId));
    }

    // DELETE /api/events/{eventId}/registrations/{userId} — organizer cancels registrant
    @DeleteMapping("/{eventId}/registrations/{userId}")
    public ResponseEntity<String> cancelRegistrantByOwner(
            @PathVariable Long eventId,
            @PathVariable Long userId,
            Authentication authentication) {
        eventRegistrationService.cancelRegistrantByOwner(authentication.getName(), eventId, userId);
        return ResponseEntity.ok("Registrant removed from event.");
    }

    // DELETE /api/events/{id} — organizer only
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteEvent(@PathVariable Long id, Authentication authentication) {
        Event value = eventService.getById(id);
        if (value == null) {
            return ResponseEntity.notFound().build();
        }
        AppUser user = appUserRepository.findByEmailIgnoreCase(authentication.getName())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found."));
        if (!authentication.getName().equalsIgnoreCase("admin@event.web")) {
            if (value.getAppUserId() == null || !value.getAppUserId().equals(user.getId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Only the organizer can delete this event.");
            }
        }
        eventService.delete(value);
        return ResponseEntity.ok("Event deleted successfully");
    }

    // GET /api/events/{id}
    @GetMapping("/{id}")
    public ResponseEntity<Event> getEvent(@PathVariable Long id) {
        var value = eventService.getById(id);
        if (value == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(value);
    }

    // PUT /api/events
    @PutMapping
    public ResponseEntity<String> updateEvent(@RequestBody Event event) {
        eventService.update(event);
        return ResponseEntity.ok("Event updated successfully");
    }
}
