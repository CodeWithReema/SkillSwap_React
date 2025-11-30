package com.example.skillswap.service;

import com.example.skillswap.dto.MatchRecommendationDto;
import com.example.skillswap.model.Profile;
import com.example.skillswap.model.User;
import com.example.skillswap.model.UserInterest;
import com.example.skillswap.model.UserSkill;
import com.example.skillswap.repository.MatchRepository;
import com.example.skillswap.repository.ProfileRepository;
import com.example.skillswap.repository.SwipeRepository;
import com.example.skillswap.repository.UserInterestRepository;
import com.example.skillswap.repository.UserRepository;
import com.example.skillswap.repository.UserSkillRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class MatchingService {

    private final UserRepository userRepository;
    private final MatchRepository matchRepository;
    private final SwipeRepository swipeRepository;
    private final ProfileRepository profileRepository;
    private final UserSkillRepository userSkillRepository;
    private final UserInterestRepository userInterestRepository;

    public MatchingService(UserRepository userRepository,
                           MatchRepository matchRepository,
                           SwipeRepository swipeRepository,
                           ProfileRepository profileRepository,
                           UserSkillRepository userSkillRepository,
                           UserInterestRepository userInterestRepository) {
        this.userRepository = userRepository;
        this.matchRepository = matchRepository;
        this.swipeRepository = swipeRepository;
        this.profileRepository = profileRepository;
        this.userSkillRepository = userSkillRepository;
        this.userInterestRepository = userInterestRepository;
    }

    /**
     * Recommend users for a given user, sorted by compatibility score.
     */
    @Transactional(readOnly = true)
    public List<MatchRecommendationDto> recommendMatches(Long userId, int limit) {
        User currentUser = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + userId));
        Profile currentProfile = profileRepository.findByUserUserId(userId);

        Map<Long, Profile> profilesByUser = profileRepository.findAll().stream()
                .filter(p -> p.getUser() != null && p.getUser().getUserId() != null)
                .collect(Collectors.toMap(p -> p.getUser().getUserId(), p -> p));

        Map<Long, List<UserSkill>> skillsByUser = userSkillRepository.findAll().stream()
                .filter(s -> s.getUser() != null && s.getUser().getUserId() != null)
                .collect(Collectors.groupingBy(s -> s.getUser().getUserId()));

        Map<Long, List<UserInterest>> interestsByUser = userInterestRepository.findAll().stream()
                .filter(i -> i.getUser() != null && i.getUser().getUserId() != null)
                .collect(Collectors.groupingBy(i -> i.getUser().getUserId()));

        Set<Long> excluded = buildExcludedUserIds(userId);

        List<MatchRecommendationDto> results = new ArrayList<>();
        for (User candidate : userRepository.findAll()) {
            if (candidate.getUserId() == null || excluded.contains(candidate.getUserId())) {
                continue;
            }

            MatchRecommendationDto dto = buildRecommendation(
                    currentUser,
                    currentProfile,
                    candidate,
                    profilesByUser.get(candidate.getUserId()),
                    skillsByUser,
                    interestsByUser);

            if (dto != null) {
                results.add(dto);
            }
        }

        return results.stream()
                .sorted(Comparator.comparingDouble(MatchRecommendationDto::getCompatibilityScore).reversed())
                .limit(Math.min(Math.max(limit, 1), 50))
                .collect(Collectors.toList());
    }

    private Set<Long> buildExcludedUserIds(Long userId) {
        Set<Long> excluded = new HashSet<>();
        excluded.add(userId);

        swipeRepository.findBySwiperUserId(userId).forEach(swipe -> {
            if (swipe.getSwipee() != null && swipe.getSwipee().getUserId() != null) {
                excluded.add(swipe.getSwipee().getUserId());
            }
        });

        matchRepository.findAll().forEach(match -> {
            if (match.getUser1() != null && userId.equals(match.getUser1().getUserId())
                    && match.getUser2() != null && match.getUser2().getUserId() != null) {
                excluded.add(match.getUser2().getUserId());
            }
            if (match.getUser2() != null && userId.equals(match.getUser2().getUserId())
                    && match.getUser1() != null && match.getUser1().getUserId() != null) {
                excluded.add(match.getUser1().getUserId());
            }
        });

        return excluded;
    }

    private MatchRecommendationDto buildRecommendation(User currentUser,
                                                       Profile currentProfile,
                                                       User candidate,
                                                       Profile candidateProfile,
                                                       Map<Long, List<UserSkill>> skillsByUser,
                                                       Map<Long, List<UserInterest>> interestsByUser) {
        List<String> sharedInterests = computeSharedInterests(
                interestsByUser.get(currentUser.getUserId()),
                interestsByUser.get(candidate.getUserId()));

        List<String> complementarySkills = computeComplementarySkills(
                skillsByUser.get(currentUser.getUserId()),
                skillsByUser.get(candidate.getUserId()));

        double score = 0d;
        List<String> reasons = new ArrayList<>();

        if (!sharedInterests.isEmpty()) {
            score += sharedInterests.size() * 8;
            reasons.add("Shared interests: " + String.join(", ", sharedInterests));
        }

        if (!complementarySkills.isEmpty()) {
            score += complementarySkills.size() * 15;
            reasons.add("Complementary skills: " + String.join(", ", complementarySkills));
        }

        if (candidate.getUniversity() != null && candidate.getUniversity().equalsIgnoreCase(currentUser.getUniversity())) {
            score += 5;
            reasons.add("Same university");
        }

        if (candidateProfile != null && currentProfile != null) {
            if (candidateProfile.getMajor() != null && candidateProfile.getMajor().equalsIgnoreCase(currentProfile.getMajor())) {
                score += 5;
                reasons.add("Same major");
            }
            if (candidateProfile.getYear() != null && candidateProfile.getYear().equalsIgnoreCase(currentProfile.getYear())) {
                score += 3;
                reasons.add("Same academic year");
            }
        }

        Double distanceKm = resolveDistance(currentUser, currentProfile, candidate, candidateProfile);
        if (distanceKm != null) {
            score += Math.max(0, 25 - (distanceKm / 5));
            reasons.add(String.format("Nearby (~%.1f km)", distanceKm));
        }

        if (score <= 0) {
            return null;
        }

        MatchRecommendationDto dto = new MatchRecommendationDto();
        dto.setUserId(candidate.getUserId());
        dto.setFullName(String.format("%s %s",
                Optional.ofNullable(candidate.getFirstName()).orElse(""),
                Optional.ofNullable(candidate.getLastName()).orElse("")).trim());
        dto.setUniversity(candidate.getUniversity());
        dto.setMajor(candidateProfile != null ? candidateProfile.getMajor() : null);
        dto.setYear(candidateProfile != null ? candidateProfile.getYear() : null);
        dto.setBio(candidateProfile != null ? candidateProfile.getBio() : null);
        dto.setDistanceKm(distanceKm);
        dto.setCompatibilityScore(score);
        dto.setSharedInterests(sharedInterests);
        dto.setComplementarySkills(complementarySkills);
        dto.setReasons(reasons);
        return dto;
    }

    private List<String> computeSharedInterests(List<UserInterest> current, List<UserInterest> candidate) {
        if (current == null || candidate == null) {
            return List.of();
        }

        Set<String> candidateInterestNames = candidate.stream()
                .map(UserInterest::getInterestName)
                .filter(this::hasValue)
                .map(String::toLowerCase)
                .collect(Collectors.toSet());

        return current.stream()
                .map(UserInterest::getInterestName)
                .filter(this::hasValue)
                .filter(name -> candidateInterestNames.contains(name.toLowerCase()))
                .distinct()
                .collect(Collectors.toList());
    }

    private List<String> computeComplementarySkills(List<UserSkill> current, List<UserSkill> candidate) {
        if (current == null || candidate == null) {
            return List.of();
        }

        Map<String, Boolean> currentOffering = buildSkillMap(current, true);
        Map<String, Boolean> currentSeeking = buildSkillMap(current, false);
        Map<String, Boolean> candidateOffering = buildSkillMap(candidate, true);
        Map<String, Boolean> candidateSeeking = buildSkillMap(candidate, false);

        Set<String> matches = new HashSet<>();
        candidateOffering.forEach((skill, offers) -> {
            if (offers && currentSeeking.getOrDefault(skill, false)) {
                matches.add(skill + " (they offer)");
            }
        });
        candidateSeeking.forEach((skill, wants) -> {
            if (wants && currentOffering.getOrDefault(skill, false)) {
                matches.add(skill + " (they need)");
            }
        });

        return new ArrayList<>(matches);
    }

    private Map<String, Boolean> buildSkillMap(List<UserSkill> skills, boolean offering) {
        Map<String, Boolean> map = new HashMap<>();
        for (UserSkill skill : skills) {
            if (!hasValue(skill.getSkillName())) {
                continue;
            }
            boolean flag = offering ? Boolean.TRUE.equals(skill.getOffering()) : Boolean.TRUE.equals(skill.getSeeking());
            if (flag) {
                map.put(skill.getSkillName().toLowerCase(), true);
            }
        }
        return map;
    }

    private Double resolveDistance(User currentUser, Profile currentProfile, User candidate, Profile candidateProfile) {
        double[] c1 = extractCoordinates(currentUser, currentProfile);
        double[] c2 = extractCoordinates(candidate, candidateProfile);
        if (c1 == null || c2 == null) {
            return null;
        }
        return calculateDistanceKm(c1[0], c1[1], c2[0], c2[1]);
    }

    private double[] extractCoordinates(User user, Profile profile) {
        if (profile != null && Boolean.TRUE.equals(profile.getShowLocation())
                && profile.getLatitude() != null && profile.getLongitude() != null) {
            return new double[]{profile.getLatitude(), profile.getLongitude()};
        }
        if (Boolean.TRUE.equals(user.getShowLocation())
                && user.getLatitude() != null && user.getLongitude() != null) {
            return new double[]{user.getLatitude(), user.getLongitude()};
        }
        return null;
    }

    private double calculateDistanceKm(double lat1, double lon1, double lat2, double lon2) {
        final int EARTH_RADIUS_KM = 6371;
        double latDistance = Math.toRadians(lat2 - lat1);
        double lonDistance = Math.toRadians(lon2 - lon1);
        double a = Math.sin(latDistance / 2) * Math.sin(latDistance / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(lonDistance / 2) * Math.sin(lonDistance / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return EARTH_RADIUS_KM * c;
    }

    private boolean hasValue(String value) {
        return value != null && !value.isBlank();
    }
}
