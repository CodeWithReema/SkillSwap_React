package com.example.skillswap.service;

import com.example.skillswap.dto.MatchRecommendationDto;
import com.example.skillswap.model.Profile;
import com.example.skillswap.model.User;
import com.example.skillswap.model.UserInterest;
import com.example.skillswap.model.UserSkill;
import com.example.skillswap.repository.ProfileRepository;
import com.example.skillswap.repository.UserInterestRepository;
import com.example.skillswap.repository.UserRepository;
import com.example.skillswap.repository.UserSkillRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class MatchingServiceTest {

    @Autowired
    private MatchingService matchingService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProfileRepository profileRepository;

    @Autowired
    private UserSkillRepository userSkillRepository;

    @Autowired
    private UserInterestRepository userInterestRepository;

    @BeforeEach
    void cleanAndSeed() {
        userSkillRepository.deleteAll();
        userInterestRepository.deleteAll();
        profileRepository.deleteAll();
        userRepository.deleteAll();

        // Current user
        User alice = buildUser("alice@test.edu", "Alice", "Morris", "State University", 33.7490, -84.3880);
        alice = userRepository.save(alice);
        profileRepository.save(buildProfile(alice, "Computer Science", "Junior"));
        userSkillRepository.save(buildSkill(alice, "JavaScript", true, false));
        userSkillRepository.save(buildSkill(alice, "Product Design", false, true));
        userInterestRepository.save(buildInterest(alice, "Hackathons"));

        // Candidate user
        User bob = buildUser("bob@test.edu", "Bob", "Lee", "State University", 33.8021, -84.3915);
        bob = userRepository.save(bob);
        profileRepository.save(buildProfile(bob, "Computer Science", "Junior"));
        userSkillRepository.save(buildSkill(bob, "Product Design", true, false));
        userSkillRepository.save(buildSkill(bob, "JavaScript", false, true));
        userInterestRepository.save(buildInterest(bob, "Hackathons"));
    }

    @Test
    void recommendMatches_returnsRankedResults() {
        User alice = userRepository.findAll().stream()
                .filter(u -> "alice@test.edu".equals(u.getEmail()))
                .findFirst()
                .orElseThrow();

        List<MatchRecommendationDto> recs = matchingService.recommendMatches(alice.getUserId(), 5);

        assertThat(recs).isNotEmpty();
        MatchRecommendationDto top = recs.getFirst();
        assertThat(top.getComplementarySkills()).anySatisfy(skill ->
                skill.toLowerCase().contains("product design"));
        assertThat(top.getCompatibilityScore()).isGreaterThan(20);
    }

    private User buildUser(String email, String first, String last, String university, double lat, double lon) {
        User user = new User();
        user.setEmail(email);
        user.setFirstName(first);
        user.setLastName(last);
        user.setUniversity(university);
        user.setPasswordHash("test");
        user.setEmailVerified(true);
        user.setDateOfBirth(LocalDate.of(2002, 1, 1));
        user.setLatitude(lat);
        user.setLongitude(lon);
        user.setShowLocation(true);
        return user;
    }

    private Profile buildProfile(User user, String major, String year) {
        Profile profile = new Profile();
        profile.setUser(user);
        profile.setMajor(major);
        profile.setYear(year);
        profile.setBio("Test bio");
        profile.setLatitude(user.getLatitude());
        profile.setLongitude(user.getLongitude());
        profile.setShowLocation(true);
        return profile;
    }

    private UserSkill buildSkill(User user, String skillName, boolean offering, boolean seeking) {
        UserSkill skill = new UserSkill();
        skill.setUser(user);
        skill.setSkillName(skillName);
        skill.setOffering(offering);
        skill.setSeeking(seeking);
        return skill;
    }

    private UserInterest buildInterest(User user, String name) {
        UserInterest interest = new UserInterest();
        interest.setUser(user);
        interest.setInterestName(name);
        interest.setCategory("General");
        return interest;
    }
}
