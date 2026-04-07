package com.eventannouncement.service;

import com.eventannouncement.model.Category;
import com.eventannouncement.repository.CategoryRepository;
import org.springframework.stereotype.Service;

import java.util.List;

// C# karsiligi: BusinessLayer/Abstract/ICategoryService.cs
//             + BusinessLayer/Concrete/CategoryManager.cs
@Service
public class CategoryService {

    private final CategoryRepository categoryRepository;

    public CategoryService(CategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    public List<Category> getList() {
        return categoryRepository.findAll();
    }

    public Category getById(Long id) {
        return categoryRepository.findById(id).orElse(null);
    }

    public void insert(Category category) {
        categoryRepository.save(category);
    }

    public void update(Category category) {
        categoryRepository.save(category);
    }

    public void delete(Category category) {
        categoryRepository.delete(category);
    }
}
