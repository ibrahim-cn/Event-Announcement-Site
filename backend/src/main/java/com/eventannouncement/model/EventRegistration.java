package com.eventannouncement.model;

import jakarta.persistence.*;

@Entity
@Table(
        name = "event_registrations",
        uniqueConstraints = @UniqueConstraint(columnNames = {"event_id", "app_user_id"})
)
public class EventRegistration extends BaseEntity {

    @Column(name = "event_id", nullable = false)
    private Long eventId;

    @Column(name = "app_user_id", nullable = false)
    private Long appUserId;

    public Long getEventId() {
        return eventId;
    }

    public void setEventId(Long eventId) {
        this.eventId = eventId;
    }

    public Long getAppUserId() {
        return appUserId;
    }

    public void setAppUserId(Long appUserId) {
        this.appUserId = appUserId;
    }
}
