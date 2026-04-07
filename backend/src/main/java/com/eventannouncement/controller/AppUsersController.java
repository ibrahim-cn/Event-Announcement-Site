package com.eventannouncement.controller;

import com.eventannouncement.model.AppUser;
import com.eventannouncement.service.AppUserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

// C# karsiligi: WebApi/Controllers/Concrete/AppUsersController.cs
@RestController
@RequestMapping("/api/appusers")
public class AppUsersController {

    private final AppUserService appUserService;

    public AppUsersController(AppUserService appUserService) {
        this.appUserService = appUserService;
    }

    // GET /api/appusers
    @GetMapping
    public ResponseEntity<List<AppUser>> userList() {
        var values = appUserService.getList();
        return ResponseEntity.ok(values);
    }

    // POST /api/appusers
    @PostMapping
    public ResponseEntity<String> createUser(@RequestBody AppUser appUser) {
        appUserService.insert(appUser);
        return ResponseEntity.ok("User registered successfully");
    }

    // DELETE /api/appusers/{id}
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteUser(@PathVariable Long id) {
        var value = appUserService.getById(id);
        appUserService.delete(value);
        return ResponseEntity.ok("User deleted successfully");
    }

    // GET /api/appusers/{id}
    @GetMapping("/{id}")
    public ResponseEntity<AppUser> getUser(@PathVariable Long id) {
        var value = appUserService.getById(id);
        return ResponseEntity.ok(value);
    }

    // PUT /api/appusers
    @PutMapping
    public ResponseEntity<String> updateUser(@RequestBody AppUser appUser) {
        appUserService.update(appUser);
        return ResponseEntity.ok("User updated successfully");
    }
}
