package com.example.skillswap.controller;

import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;
import com.example.skillswap.model.Profile;
import com.example.skillswap.repository.ProfileRepository;
import com.example.skillswap.service.GeolocationService;

@RestController
@RequestMapping("/api/profiles")
public class ProfileController {

    private final ProfileRepository repo;
    private final GeolocationService geolocationService;

    public ProfileController(ProfileRepository repo, GeolocationService geolocationService) {
        this.repo = repo;
        this.geolocationService = geolocationService;
    }

    @GetMapping
    public List<Profile> getAllProfiles() {
        // Use findAllWithUser to eagerly load user relationship
        // This ensures profiles have their user object populated for frontend matching
        return repo.findAllWithUser();
    }

    @PostMapping
    public Profile addProfile(@RequestBody Profile profile) {
        // Geocode location if provided
        if (profile.getLocation() != null && !profile.getLocation().trim().isEmpty()) {
            geocodeProfileLocation(profile);
        }
        return repo.save(profile);
    }

    @PutMapping("/{id}")
    public Profile updateProfile(@PathVariable Long id, @RequestBody Profile profile) {
        Profile existing = repo.findById(id)
                .orElseThrow(() -> new RuntimeException("Profile not found"));
        existing.setBio(profile.getBio());
        existing.setMajor(profile.getMajor());
        existing.setYear(profile.getYear());
        
        // Handle location update with geocoding
        String newLocation = profile.getLocation();
        if (newLocation != null && !newLocation.equals(existing.getLocation())) {
            existing.setLocation(newLocation);
            geocodeProfileLocation(existing);
        }
        
        existing.setCareerGoals(profile.getCareerGoals());
        existing.setAvailability(profile.getAvailability());
        existing.setLinkedin(profile.getLinkedin());
        existing.setGithub(profile.getGithub());
        existing.setPortfolio(profile.getPortfolio());
        existing.setCareer(profile.getCareer());
        existing.setCareerExperience(profile.getCareerExperience());
        existing.setResearchPublications(profile.getResearchPublications());
        existing.setAwards(profile.getAwards());
        
        // Update showLocation flag
        if (profile.getShowLocation() != null) {
            existing.setShowLocation(profile.getShowLocation());
        }
        
        // Update coordinates if provided directly (from precise location)
        if (profile.getLatitude() != null && profile.getLongitude() != null) {
            existing.setLatitude(profile.getLatitude());
            existing.setLongitude(profile.getLongitude());
        }
        
        return repo.save(existing);
    }
    
    /**
     * Update location with coordinates (for precise location from browser)
     */
    @PutMapping("/{id}/location")
    public Profile updateLocation(@PathVariable Long id, @RequestBody Map<String, Object> locationData) {
        Profile existing = repo.findById(id)
                .orElseThrow(() -> new RuntimeException("Profile not found"));
        
        if (locationData.containsKey("latitude") && locationData.containsKey("longitude")) {
            existing.setLatitude(((Number) locationData.get("latitude")).doubleValue());
            existing.setLongitude(((Number) locationData.get("longitude")).doubleValue());
        }
        
        if (locationData.containsKey("location")) {
            existing.setLocation((String) locationData.get("location"));
        }
        
        if (locationData.containsKey("showLocation")) {
            existing.setShowLocation((Boolean) locationData.get("showLocation"));
        }
        
        return repo.save(existing);
    }
    
    /**
     * Helper method to geocode profile location
     */
    private void geocodeProfileLocation(Profile profile) {
        if (profile.getLocation() != null && !profile.getLocation().trim().isEmpty()) {
            Map<String, Double> coordinates = geolocationService.geocodeCity(profile.getLocation());
            if (coordinates != null) {
                profile.setLatitude(coordinates.get("latitude"));
                profile.setLongitude(coordinates.get("longitude"));
            }
        }
    }

    @GetMapping("/{id}")
    public Profile getProfile(@PathVariable Long id) {
        return repo.findById(id)
                .orElseThrow(() -> new RuntimeException("Profile not found"));
    }
    
    @GetMapping("/user/{userId}")
    public Profile getProfileByUserId(@PathVariable Long userId) {
        Profile profile = repo.findByUserUserId(userId);
        if (profile == null) {
            throw new RuntimeException("Profile not found for user ID: " + userId);
        }
        return profile;
    }
    
    /**
     * Get city suggestions for autocomplete
     */
    @GetMapping("/cities/suggestions")
    public List<String> getCitySuggestions(@RequestParam String q) {
        return geolocationService.getCitySuggestions(q);
    }
}
