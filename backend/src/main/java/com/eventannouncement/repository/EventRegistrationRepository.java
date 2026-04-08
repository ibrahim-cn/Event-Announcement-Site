package com.eventannouncement.repository;

import com.eventannouncement.model.EventRegistration;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface EventRegistrationRepository extends JpaRepository<EventRegistration, Long> {

    boolean existsByEventIdAndAppUserId(Long eventId, Long appUserId);

    void deleteByEventId(Long eventId);
}
