package com.eventannouncement.dto;

import java.time.LocalDateTime;

// C# karsiligi: BusinessLayer/DTOs/EventDtos/EventDtos.cs

public class ResultEventDto {
    private Long id;
    private String title = "";
    private String description = "";
    private LocalDateTime date;
    private String time = "";
    private String location = "";
    private boolean status;
    private Long categoryId;
    private String categoryName = "";
    private Long appUserId;

    public ResultEventDto() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public LocalDateTime getDate() { return date; }
    public void setDate(LocalDateTime date) { this.date = date; }
    public String getTime() { return time; }
    public void setTime(String time) { this.time = time; }
    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }
    public boolean isStatus() { return status; }
    public void setStatus(boolean status) { this.status = status; }
    public Long getCategoryId() { return categoryId; }
    public void setCategoryId(Long categoryId) { this.categoryId = categoryId; }
    public String getCategoryName() { return categoryName; }
    public void setCategoryName(String categoryName) { this.categoryName = categoryName; }
    public Long getAppUserId() { return appUserId; }
    public void setAppUserId(Long appUserId) { this.appUserId = appUserId; }
}
