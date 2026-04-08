package com.eventannouncement.service;

import com.eventannouncement.model.AppUser;
import com.eventannouncement.repository.AppUserRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AppUserService {

    private final AppUserRepository appUserRepository;

    public AppUserService(AppUserRepository appUserRepository) {
        this.appUserRepository = appUserRepository;
    }

    public List<AppUser> getList() {
        return appUserRepository.findAll();
    }

    public AppUser getById(Long id) {
        return appUserRepository.findById(id).orElse(null);
    }

    public void insert(AppUser appUser) {
        appUserRepository.save(appUser);
    }

    public void update(AppUser appUser) {
        appUserRepository.save(appUser);
    }

    public void delete(AppUser appUser) {
        appUserRepository.delete(appUser);
    }
}
