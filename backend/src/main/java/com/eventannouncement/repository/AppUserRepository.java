package com.eventannouncement.repository;

import com.eventannouncement.model.AppUser;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

// C# karsiligi: DataAccessLayer/Abstract/IAppUserRepository.cs
// + DataAccessLayer/Concrete/EntityFramework/EfAppUserRepository.cs
// Spring Data JPA otomatik olarak CRUD implementasyonunu saglar (IGenericRepository + EfGenericRepository yerine)
@Repository
public interface AppUserRepository extends JpaRepository<AppUser, Long> {
}
