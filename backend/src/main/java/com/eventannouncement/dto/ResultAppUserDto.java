package com.eventannouncement.dto;

// C# karsiligi: BusinessLayer/DTOs/AppUserDtos/AppUserDtos.cs

public class ResultAppUserDto {
    private Long id;
    private String username = "";
    private String email = "";
    private boolean status;

    public ResultAppUserDto() {}

    public ResultAppUserDto(Long id, String username, String email, boolean status) {
        this.id = id;
        this.username = username;
        this.email = email;
        this.status = status;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public boolean isStatus() { return status; }
    public void setStatus(boolean status) { this.status = status; }
}
