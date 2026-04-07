package com.eventannouncement.controller;

import com.eventannouncement.model.Category;
import com.eventannouncement.service.CategoryService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

// C# karsiligi: WebApi/Controllers/Concrete/CategoriesController.cs
@RestController
@RequestMapping("/api/categories")
public class CategoriesController {

    private final CategoryService categoryService;

    public CategoriesController(CategoryService categoryService) {
        this.categoryService = categoryService;
    }

    // GET /api/categories
    @GetMapping
    public ResponseEntity<List<Category>> categoryList() {
        var values = categoryService.getList();
        return ResponseEntity.ok(values);
    }

    // POST /api/categories
    @PostMapping
    public ResponseEntity<String> createCategory(@RequestBody Category category) {
        categoryService.insert(category);
        return ResponseEntity.ok("Category added successfully");
    }

    // DELETE /api/categories/{id}
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteCategory(@PathVariable Long id) {
        var value = categoryService.getById(id);
        categoryService.delete(value);
        return ResponseEntity.ok("Category deleted successfully");
    }

    // GET /api/categories/{id}
    @GetMapping("/{id}")
    public ResponseEntity<Category> getCategory(@PathVariable Long id) {
        var value = categoryService.getById(id);
        return ResponseEntity.ok(value);
    }

    // PUT /api/categories
    @PutMapping
    public ResponseEntity<String> updateCategory(@RequestBody Category category) {
        categoryService.update(category);
        return ResponseEntity.ok("Category updated successfully");
    }
}
