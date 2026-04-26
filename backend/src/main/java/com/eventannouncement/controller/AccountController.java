package com.eventannouncement.controller;

import com.eventannouncement.model.AppUser;
import com.eventannouncement.service.AccountService;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/account")
public class AccountController {

    private final AccountService accountService;

    public AccountController(AccountService accountService) {
        this.accountService = accountService;
    }

    @GetMapping("/me")
    public ResponseEntity<Map<String, Object>> me(Authentication authentication) {
        AppUser user = accountService.getCurrentUser(authentication.getName());
        return ResponseEntity.ok(Map.of(
                "id", user.getId(),
                "username", user.getUsername(),
                "email", user.getEmail(),
                "phone", user.getPhone(),
                "profileImageUrl", user.getProfileImageUrl()
        ));
    }

    @PostMapping(value = "/me/profile-image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Map<String, String>> uploadProfileImage(
            Authentication authentication,
            @RequestParam("file") MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Please select an image.");
        }
        if (file.getSize() > 5L * 1024 * 1024) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Image is too large (max 5MB).");
        }
        String contentType = file.getContentType() == null ? "" : file.getContentType().toLowerCase();
        if (!contentType.startsWith("image/")) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Only image files are allowed.");
        }

        String original = file.getOriginalFilename() == null ? "profile" : file.getOriginalFilename();
        String ext = "";
        int dot = original.lastIndexOf('.');
        if (dot >= 0 && dot < original.length() - 1) {
            ext = original.substring(dot).toLowerCase();
        }
        String fileName = "profile-" + UUID.randomUUID() + ext;
        Path uploadDir = Path.of("..", "uploads").toAbsolutePath().normalize();
        Path target = uploadDir.resolve(fileName);
        try {
            Files.createDirectories(uploadDir);
            Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Profile image upload failed.");
        }

        String url = "/uploads/" + fileName;
        accountService.updateProfileImage(authentication.getName(), url);
        return ResponseEntity.ok(Map.of("url", url));
    }

    @DeleteMapping("/me")
    public ResponseEntity<Map<String, String>> deleteMe(Authentication authentication) {
        accountService.deleteCurrentUser(authentication.getName());
        return ResponseEntity.ok(Map.of("message", "Account deleted successfully."));
    }
}
