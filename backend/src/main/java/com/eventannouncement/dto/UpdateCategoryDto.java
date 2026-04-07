package com.eventannouncement.dto;

public class UpdateCategoryDto {
    private Long id;
    private String categoryName = "";
    private boolean status;

    public UpdateCategoryDto() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getCategoryName() { return categoryName; }
    public void setCategoryName(String categoryName) { this.categoryName = categoryName; }
    public boolean isStatus() { return status; }
    public void setStatus(boolean status) { this.status = status; }
}
