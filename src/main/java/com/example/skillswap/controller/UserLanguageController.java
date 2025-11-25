package com.example.skillswap.controller;

import com.example.skillswap.model.UserLanguage;
import com.example.skillswap.repository.UserLanguageRepository;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/languages")
public class UserLanguageController {

    private final UserLanguageRepository repo;

    public UserLanguageController(UserLanguageRepository repo) {
        this.repo = repo;
    }

    @GetMapping
    public List<UserLanguage> getAllLanguages() {
        return repo.findAll();
    }

    @GetMapping("/user/{userId}")
    public List<UserLanguage> getUserLanguages(@PathVariable Long userId) {
        return repo.findByUser_UserId(userId);
    }

    @PostMapping
    public UserLanguage addLanguage(@RequestBody UserLanguage language) {
        return repo.save(language);
    }

    @DeleteMapping("/{id}")
    public void deleteLanguage(@PathVariable Long id) {
        repo.deleteById(id);
    }
}

