package com.example.skillswap.controller;

import com.example.skillswap.model.Profile;
import com.example.skillswap.model.ProfilePhoto;
import com.example.skillswap.repository.ProfilePhotoRepository;
import com.example.skillswap.repository.ProfileRepository;
import com.example.skillswap.service.FileStorageService;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/photos")
public class ProfilePhotoController {

    private final ProfilePhotoRepository repo;
    private final ProfileRepository profileRepository;
    private final FileStorageService fileStorageService;

    public ProfilePhotoController(ProfilePhotoRepository repo,
                                  ProfileRepository profileRepository,
                                  FileStorageService fileStorageService) {
        this.repo = repo;
        this.profileRepository = profileRepository;
        this.fileStorageService = fileStorageService;
    }

    // GET all photos
    @GetMapping
    public List<ProfilePhoto> getAllPhotos() {
        return repo.findAll();
    }

    // GET all photos by profile_id
    @GetMapping("/{profileId}")
    public List<ProfilePhoto> getPhotosByProfile(@PathVariable Long profileId) {
        return repo.findByProfile_ProfileId(profileId);
    }

    // POST add a new photo by URL (legacy path)
    @PostMapping
    public ProfilePhoto addPhoto(@RequestBody ProfilePhoto photo) {
        return repo.save(photo);
    }

    // POST multipart upload to local filesystem and persist URL
    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ProfilePhoto uploadPhoto(@RequestParam("file") MultipartFile file,
                                    @RequestParam("profileId") Long profileId,
                                    @RequestParam(name = "isPrimary", defaultValue = "true") boolean isPrimary) throws IOException {
        Profile profile = profileRepository.findById(profileId)
                .orElseThrow(() -> new RuntimeException("Profile not found: " + profileId));

        String publicUrl = fileStorageService.store(file);

        ProfilePhoto photo = new ProfilePhoto();
        photo.setProfile(profile);
        photo.setPhotoUrl(publicUrl);
        photo.setIsPrimary(isPrimary);
        return repo.save(photo);
    }
}
