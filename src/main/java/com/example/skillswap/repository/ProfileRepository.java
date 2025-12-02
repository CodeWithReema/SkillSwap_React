package com.example.skillswap.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import com.example.skillswap.model.Profile;
import java.util.List;

public interface ProfileRepository extends JpaRepository<Profile, Long> {
    
    // Find all profiles with user relationship eagerly loaded
    @Query("SELECT p FROM Profile p JOIN FETCH p.user")
    List<Profile> findAllWithUser();
    
    // Find profiles with location enabled
    @Query("SELECT p FROM Profile p WHERE p.showLocation = true AND p.latitude IS NOT NULL AND p.longitude IS NOT NULL")
    List<Profile> findProfilesWithLocation();
    
    // Find profile by user ID
    Profile findByUserUserId(Long userId);
}
