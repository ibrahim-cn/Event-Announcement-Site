package com.eventannouncement.service;

import com.eventannouncement.model.Event;
import com.eventannouncement.repository.EventRegistrationRepository;
import com.eventannouncement.repository.EventRepository;
import org.springframework.stereotype.Service;

import java.util.List;

// C# karsiligi: BusinessLayer/Abstract/IEventService.cs
//             + BusinessLayer/Concrete/EventManager.cs
@Service
public class EventService {

    private final EventRepository eventRepository;
    private final EventRegistrationRepository eventRegistrationRepository;

    public EventService(EventRepository eventRepository, EventRegistrationRepository eventRegistrationRepository) {
        this.eventRepository = eventRepository;
        this.eventRegistrationRepository = eventRegistrationRepository;
    }

    public List<Event> getList() {
        return eventRepository.findAll();
    }

    public Event getById(Long id) {
        return eventRepository.findById(id).orElse(null);
    }

    public void insert(Event event) {
        eventRepository.save(event);
    }

    public void update(Event event) {
        eventRepository.save(event);
    }

    public void delete(Event event) {
        if (event == null || event.getId() == null) {
            return;
        }
        eventRegistrationRepository.deleteByEventId(event.getId());
        eventRepository.delete(event);
    }
}
