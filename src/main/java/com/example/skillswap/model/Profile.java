package com.example.skillswap.model;

import jakarta.persistence.*;

@Entity
@Table(name = "profile")
public class Profile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "profile_id")
    private Long profileId;

    @OneToOne
    @JoinColumn(name = "user_id", referencedColumnName = "user_id")
    private User user;

    @Column(name = "bio")
    private String bio;

    @Column(name = "location")
    private String location;

    @Column(name = "major")
    private String major;

    @Column(name = "year")
    private String year;

    @Column(name = "career_goals")
    private String careerGoals;

    @Column(name = "availability")
    private String availability;

    @Column(name = "linkedin")
    private String linkedin;

    @Column(name = "github")
    private String github;

    @Column(name = "portfolio")
    private String portfolio;

    @Column(name = "career")
    private String career;

    @Column(name = "career_experience")
    private String careerExperience;

    @Column(name = "research_publications")
    private String researchPublications;

    @Column(name = "awards")
    private String awards;

    // Getters and Setters
    public Long getProfileId() { return profileId; }
    public void setProfileId(Long profileId) { this.profileId = profileId; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public String getBio() { return bio; }
    public void setBio(String bio) { this.bio = bio; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public String getMajor() { return major; }
    public void setMajor(String major) { this.major = major; }

    public String getYear() { return year; }
    public void setYear(String year) { this.year = year; }

    public String getCareerGoals() { return careerGoals; }
    public void setCareerGoals(String careerGoals) { this.careerGoals = careerGoals; }

    public String getAvailability() { return availability; }
    public void setAvailability(String availability) { this.availability = availability; }

    public String getLinkedin() { return linkedin; }
    public void setLinkedin(String linkedin) { this.linkedin = linkedin; }

    public String getGithub() { return github; }
    public void setGithub(String github) { this.github = github; }

    public String getPortfolio() { return portfolio; }
    public void setPortfolio(String portfolio) { this.portfolio = portfolio; }

    public String getCareer() { return career; }
    public void setCareer(String career) { this.career = career; }

    public String getCareerExperience() { return careerExperience; }
    public void setCareerExperience(String careerExperience) { this.careerExperience = careerExperience; }

    public String getResearchPublications() { return researchPublications; }
    public void setResearchPublications(String researchPublications) { this.researchPublications = researchPublications; }

    public String getAwards() { return awards; }
    public void setAwards(String awards) { this.awards = awards; }
}
