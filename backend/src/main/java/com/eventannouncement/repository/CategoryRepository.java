package com.eventannouncement.repository;

import com.eventannouncement.model.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

// C# karsiligi: DataAccessLayer/Abstract/ICategoryRepository.cs
// + DataAccessLayer/Concrete/EntityFramework/EfCategoryRepository.cs
@Repository
public interface CategoryRepository extends JpaRepository<Category, Long> {
}
