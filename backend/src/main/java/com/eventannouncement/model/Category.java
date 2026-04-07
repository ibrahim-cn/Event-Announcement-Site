package com.eventannouncement.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;

// C# karsiligi: EntityLayer/Models/Concrete/Category.cs
@Entity
@Table(name = "categories")
public class Category extends BaseEntity {

    private String categoryName = "";

    @OneToMany(mappedBy = "category", cascade = CascadeType.ALL)
    @JsonIgnore
    private List<Event> events = new ArrayList<>();

    // --- Getters & Setters ---

    public String getCategoryName() {
        return categoryName;
    }

    public void setCategoryName(String categoryName) {
        this.categoryName = categoryName;
    }

    public List<Event> getEvents() {
        return events;
    }

    public void setEvents(List<Event> events) {
        this.events = events;
    }
}
