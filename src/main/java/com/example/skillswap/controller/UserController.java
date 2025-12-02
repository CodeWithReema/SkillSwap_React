package com.example.skillswap.controller;

import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;
import com.example.skillswap.model.Profile;
import com.example.skillswap.model.User;
import com.example.skillswap.repository.ProfileRepository;
import com.example.skillswap.repository.UserRepository;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserRepository repo;
    private final ProfileRepository profileRepository;

    public UserController(UserRepository repo, ProfileRepository profileRepository) {
        this.repo = repo;
        this.profileRepository = profileRepository;
    }

    @GetMapping
    public List<User> getAllUsers() {
        return repo.findAll();
    }

    @PostMapping
    public User addUser(@RequestBody User user) {
        User saved = repo.save(user);

        // Ensure every user has a profile immediately after signup
        if (profileRepository.findByUserUserId(saved.getUserId()) == null) {
            Profile profile = new Profile();
            profile.setUser(saved);
            profileRepository.save(profile);
        }

        return saved;
    }

    @PutMapping("/{id}")
    public User updateUser(@PathVariable Long id, @RequestBody User userDetails) {
        User user = repo.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found for this id :: " + id));

        if (userDetails.getFirstName() != null) {
            user.setFirstName(userDetails.getFirstName());
        }
        if (userDetails.getLastName() != null) {
            user.setLastName(userDetails.getLastName());
        }
        if (userDetails.getUniversity() != null) {
            user.setUniversity(userDetails.getUniversity());
        }
        if (userDetails.getEmail() != null) {
            user.setEmail(userDetails.getEmail());
        }
        
        // Update geolocation fields
        if (userDetails.getLatitude() != null) {
            user.setLatitude(userDetails.getLatitude());
        }
        if (userDetails.getLongitude() != null) {
            user.setLongitude(userDetails.getLongitude());
        }
        if (userDetails.getShowLocation() != null) {
            user.setShowLocation(userDetails.getShowLocation());
        }

        final User updatedUser = repo.save(user);
        return updatedUser;
    }
    
    /**
     * Update user location with coordinates (for precise location from browser)
     */
    @PutMapping("/{id}/location")
    public User updateUserLocation(@PathVariable Long id, @RequestBody Map<String, Object> locationData) {
        User user = repo.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found for this id :: " + id));
        
        if (locationData.containsKey("latitude") && locationData.containsKey("longitude")) {
            user.setLatitude(((Number) locationData.get("latitude")).doubleValue());
            user.setLongitude(((Number) locationData.get("longitude")).doubleValue());
        }
        
        if (locationData.containsKey("showLocation")) {
            user.setShowLocation((Boolean) locationData.get("showLocation"));
        }
        
        return repo.save(user);
    }

    @GetMapping("/{id}")
    public User getUser(@PathVariable Long id) {
        return repo.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found for this id :: " + id));
    }
}
