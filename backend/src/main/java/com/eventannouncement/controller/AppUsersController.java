package com.eventannouncement.controller;

import com.eventannouncement.model.AppUser;
import com.eventannouncement.service.AppUserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/appusers")
public class AppUsersController {

    private final AppUserService appUserService;

    public AppUsersController(AppUserService appUserService) {
        this.appUserService = appUserService;
    }

    @GetMapping
    public ResponseEntity<List<AppUser>> userList() {
        return ResponseEntity.ok(appUserService.getList());
    }

    @PostMapping
    public ResponseEntity<String> createUser(@RequestBody AppUser appUser) {
        appUserService.insert(appUser);
        return ResponseEntity.ok("User registered successfully");
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteUser(@PathVariable Long id) {
        AppUser value = appUserService.getById(id);
        if (value == null) {
            return ResponseEntity.notFound().build();
        }
        appUserService.delete(value);
        return ResponseEntity.ok("User deleted successfully");
    }

    @GetMapping("/{id}")
    public ResponseEntity<AppUser> getUser(@PathVariable Long id) {
        AppUser value = appUserService.getById(id);
        if (value == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(value);
    }

    @PutMapping
    public ResponseEntity<String> updateUser(@RequestBody AppUser appUser) {
        appUserService.update(appUser);
        return ResponseEntity.ok("User updated successfully");
    }
}
