package com.example.skillswap.dto;

import java.util.ArrayList;
import java.util.List;

/**
 * Lightweight response DTO for match recommendations.
 */
public class MatchRecommendationDto {
    private Long userId;
    private String fullName;
    private String university;
    private String major;
    private String year;
    private String bio;
    private Double distanceKm;
    private double compatibilityScore;
    private List<String> sharedInterests = new ArrayList<>();
    private List<String> complementarySkills = new ArrayList<>();
    private List<String> reasons = new ArrayList<>();

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getUniversity() {
        return university;
    }

    public void setUniversity(String university) {
        this.university = university;
    }

    public String getMajor() {
        return major;
    }

    public void setMajor(String major) {
        this.major = major;
    }

    public String getYear() {
        return year;
    }

    public void setYear(String year) {
        this.year = year;
    }

    public String getBio() {
        return bio;
    }

    public void setBio(String bio) {
        this.bio = bio;
    }

    public Double getDistanceKm() {
        return distanceKm;
    }

    public void setDistanceKm(Double distanceKm) {
        this.distanceKm = distanceKm;
    }

    public double getCompatibilityScore() {
        return compatibilityScore;
    }

    public void setCompatibilityScore(double compatibilityScore) {
        this.compatibilityScore = compatibilityScore;
    }

    public List<String> getSharedInterests() {
        return sharedInterests;
    }

    public void setSharedInterests(List<String> sharedInterests) {
        this.sharedInterests = sharedInterests;
    }

    public List<String> getComplementarySkills() {
        return complementarySkills;
    }

    public void setComplementarySkills(List<String> complementarySkills) {
        this.complementarySkills = complementarySkills;
    }

    public List<String> getReasons() {
        return reasons;
    }

    public void setReasons(List<String> reasons) {
        this.reasons = reasons;
    }
}
