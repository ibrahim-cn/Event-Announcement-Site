package com.eventannouncement.repository;

import com.eventannouncement.model.EventRegistration;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EventRegistrationRepository extends JpaRepository<EventRegistration, Long> {

    boolean existsByEventIdAndAppUserId(Long eventId, Long appUserId);

    Optional<EventRegistration> findByEventIdAndAppUserId(Long eventId, Long appUserId);

    List<EventRegistration> findAllByEventId(Long eventId);

    List<EventRegistration> findAllByAppUserId(Long appUserId);

    void deleteAllByAppUserId(Long appUserId);

    void deleteByEventId(Long eventId);
}
