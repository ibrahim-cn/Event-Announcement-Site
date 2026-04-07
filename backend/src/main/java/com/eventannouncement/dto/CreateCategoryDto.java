package com.eventannouncement.dto;

public class CreateCategoryDto {
    private String categoryName = "";

    public CreateCategoryDto() {}

    public String getCategoryName() { return categoryName; }
    public void setCategoryName(String categoryName) { this.categoryName = categoryName; }
}
