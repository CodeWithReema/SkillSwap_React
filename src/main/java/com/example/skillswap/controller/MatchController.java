package com.example.skillswap.controller;

import com.example.skillswap.dto.MatchRecommendationDto;
import com.example.skillswap.model.Match;
import com.example.skillswap.repository.MatchRepository;
import com.example.skillswap.service.MatchingService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/matches")
public class MatchController {

    private final MatchRepository matchRepository;
    private final MatchingService matchingService;

    public MatchController(MatchRepository matchRepository, MatchingService matchingService) {
        this.matchRepository = matchRepository;
        this.matchingService = matchingService;
    }

    @GetMapping
    public List<Match> getAllMatches() {
        return matchRepository.findAll();
    }

    @PostMapping
    public Match createMatch(@RequestBody Match match) {
        return matchRepository.save(match);
    }

    @GetMapping("/recommendations/{userId}")
    public List<MatchRecommendationDto> getRecommendations(@PathVariable Long userId,
                                                           @RequestParam(name = "limit", defaultValue = "10") int limit) {
        return matchingService.recommendMatches(userId, limit);
    }
}
