package com.eventannouncement.repository;

import com.eventannouncement.model.Event;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

// C# karsiligi: DataAccessLayer/Abstract/IEventRepository.cs
// + DataAccessLayer/Concrete/EntityFramework/EfEventRepository.cs
@Repository
public interface EventRepository extends JpaRepository<Event, Long> {
}
