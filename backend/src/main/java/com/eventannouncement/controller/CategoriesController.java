package com.eventannouncement.controller;

import com.eventannouncement.model.Category;
import com.eventannouncement.service.CategoryService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
public class CategoriesController {

    private final CategoryService categoryService;

    public CategoriesController(CategoryService categoryService) {
        this.categoryService = categoryService;
    }

    @GetMapping
    public ResponseEntity<List<Category>> categoryList() {
        return ResponseEntity.ok(categoryService.getList());
    }

    @PostMapping
    public ResponseEntity<String> createCategory(@RequestBody Category category) {
        categoryService.insert(category);
        return ResponseEntity.ok("Category added successfully");
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteCategory(@PathVariable Long id) {
        Category value = categoryService.getById(id);
        if (value == null) {
            return ResponseEntity.notFound().build();
        }
        categoryService.delete(value);
        return ResponseEntity.ok("Category deleted successfully");
    }

    @GetMapping("/{id}")
    public ResponseEntity<Category> getCategory(@PathVariable Long id) {
        Category value = categoryService.getById(id);
        if (value == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(value);
    }

    @PutMapping
    public ResponseEntity<String> updateCategory(@RequestBody Category category) {
        categoryService.update(category);
        return ResponseEntity.ok("Category updated successfully");
    }
}
