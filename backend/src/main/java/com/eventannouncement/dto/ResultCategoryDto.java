package com.eventannouncement.dto;

// C# karsiligi: BusinessLayer/DTOs/CategoryDtos/CategoryDtos.cs

public class ResultCategoryDto {
    private Long id;
    private String categoryName = "";
    private boolean status;

    public ResultCategoryDto() {}

    public ResultCategoryDto(Long id, String categoryName, boolean status) {
        this.id = id;
        this.categoryName = categoryName;
        this.status = status;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getCategoryName() { return categoryName; }
    public void setCategoryName(String categoryName) { this.categoryName = categoryName; }
    public boolean isStatus() { return status; }
    public void setStatus(boolean status) { this.status = status; }
}
