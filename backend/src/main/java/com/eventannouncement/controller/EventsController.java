package com.eventannouncement.controller;

import com.eventannouncement.model.Event;
import com.eventannouncement.service.EventService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

// C# karsiligi: WebApi/Controllers/Concrete/EventsController.cs
@RestController
@RequestMapping("/api/events")
public class EventsController {

    private final EventService eventService;

    public EventsController(EventService eventService) {
        this.eventService = eventService;
    }

    // GET /api/events
    @GetMapping
    public ResponseEntity<List<Event>> eventList() {
        var values = eventService.getList();
        return ResponseEntity.ok(values);
    }

    // POST /api/events
    @PostMapping
    public ResponseEntity<String> createEvent(@RequestBody Event event) {
        eventService.insert(event);
        return ResponseEntity.ok("Event created successfully");
    }

    // DELETE /api/events/{id}
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteEvent(@PathVariable Long id) {
        var value = eventService.getById(id);
        eventService.delete(value);
        return ResponseEntity.ok("Event deleted successfully");
    }

    // GET /api/events/{id}
    @GetMapping("/{id}")
    public ResponseEntity<Event> getEvent(@PathVariable Long id) {
        var value = eventService.getById(id);
        return ResponseEntity.ok(value);
    }

    // PUT /api/events
    @PutMapping
    public ResponseEntity<String> updateEvent(@RequestBody Event event) {
        eventService.update(event);
        return ResponseEntity.ok("Event updated successfully");
    }
}
