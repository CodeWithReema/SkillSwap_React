package com.example.skillswap.controller;

import org.springframework.web.bind.annotation.*;
import java.util.List;
import com.example.skillswap.model.Profile;
import com.example.skillswap.repository.ProfileRepository;

@RestController
@RequestMapping("/api/profiles")
public class ProfileController {

    private final ProfileRepository repo;

    public ProfileController(ProfileRepository repo) {
        this.repo = repo;
    }

    @GetMapping
    public List<Profile> getAllProfiles() {
        return repo.findAll();
    }

    @PostMapping
    public Profile addProfile(@RequestBody Profile profile) {
        return repo.save(profile);
    }

    @PutMapping("/{id}")
    public Profile updateProfile(@PathVariable Long id, @RequestBody Profile profile) {
        Profile existing = repo.findById(id)
                .orElseThrow(() -> new RuntimeException("Profile not found"));
        existing.setBio(profile.getBio());
        existing.setMajor(profile.getMajor());
        existing.setYear(profile.getYear());
        existing.setLocation(profile.getLocation());
        existing.setCareerGoals(profile.getCareerGoals());
        existing.setAvailability(profile.getAvailability());
        existing.setLinkedin(profile.getLinkedin());
        existing.setGithub(profile.getGithub());
        existing.setPortfolio(profile.getPortfolio());
        existing.setCareer(profile.getCareer());
        existing.setCareerExperience(profile.getCareerExperience());
        existing.setResearchPublications(profile.getResearchPublications());
        existing.setAwards(profile.getAwards());
        return repo.save(existing);
    }

    @GetMapping("/{id}")
    public Profile getProfile(@PathVariable Long id) {
        return repo.findById(id)
                .orElseThrow(() -> new RuntimeException("Profile not found"));
    }
}
