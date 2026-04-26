package com.eventannouncement.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;

// C# karsiligi: EntityLayer/Models/Concrete/AppUser.cs
@Entity
@Table(name = "app_users")
public class AppUser extends BaseEntity {

    private String username = "";

    private String email = "";

    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    private String password = "";

    private String phone = "";

    @Column(name = "profile_image_url")
    private String profileImageUrl = "";

    @OneToMany(mappedBy = "appUser", cascade = CascadeType.ALL)
    @JsonIgnore
    private List<Event> events = new ArrayList<>();

    // --- Getters & Setters ---

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getProfileImageUrl() {
        return profileImageUrl;
    }

    public void setProfileImageUrl(String profileImageUrl) {
        this.profileImageUrl = profileImageUrl;
    }

    public List<Event> getEvents() {
        return events;
    }

    public void setEvents(List<Event> events) {
        this.events = events;
    }
}
