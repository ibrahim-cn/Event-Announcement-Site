package com.eventannouncement.service;

import com.eventannouncement.model.AppUser;
import com.eventannouncement.repository.AppUserRepository;
import org.springframework.stereotype.Service;

import java.util.List;

// C# karsiligi: BusinessLayer/Abstract/IAppUserService.cs
//             + BusinessLayer/Concrete/AppUserManager.cs
@Service
public class AppUserService {

    private final AppUserRepository appUserRepository;

    public AppUserService(AppUserRepository appUserRepository) {
        this.appUserRepository = appUserRepository;
    }

    // C#: TGetList()
    public List<AppUser> getList() {
        return appUserRepository.findAll();
    }

    // C#: TGetById(int id)
    public AppUser getById(Long id) {
        return appUserRepository.findById(id).orElse(null);
    }

    // C#: TInsert(T entity)
    public void insert(AppUser appUser) {
        appUserRepository.save(appUser);
    }

    // C#: TUpdate(T entity)
    public void update(AppUser appUser) {
        appUserRepository.save(appUser);
    }

    // C#: TDelete(T entity)
    public void delete(AppUser appUser) {
        appUserRepository.delete(appUser);
    }
}
