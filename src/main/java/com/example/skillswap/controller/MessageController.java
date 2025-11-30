package com.example.skillswap.controller;

import com.example.skillswap.model.Match;
import com.example.skillswap.model.Message;
import com.example.skillswap.model.User;
import com.example.skillswap.repository.MatchRepository;
import com.example.skillswap.repository.MessageRepository;
import com.example.skillswap.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/messages")
public class MessageController {

    private final MessageRepository messageRepo;
    private final MatchRepository matchRepo;
    private final UserRepository userRepo;

    public MessageController(MessageRepository messageRepo,
                             MatchRepository matchRepo,
                             UserRepository userRepo) {
        this.messageRepo = messageRepo;
        this.matchRepo = matchRepo;
        this.userRepo = userRepo;
    }

    // Get all messages for a given match (clearer path)
    @GetMapping("/match/{matchId}")
    public List<Message> getMessagesByMatch(@PathVariable Long matchId) {
        if (!matchRepo.existsById(matchId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Match not found");
        }
        return messageRepo.findByMatchMatchIdOrderBySentAtAsc(matchId);
    }

    // Backwards-compatible endpoint if frontend calls /api/messages/{matchId}
    @GetMapping("/{matchId}")
    public List<Message> getMessagesByMatchLegacy(@PathVariable Long matchId) {
        return getMessagesByMatch(matchId);
    }

    // Send a message (linked to match + sender) with basic validation
    @PostMapping
    public Message sendMessage(@RequestBody Message incoming) {

        // Validate required fields
        if (incoming.getMatch() == null || incoming.getMatch().getMatchId() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Match ID is required");
        }

        if (incoming.getSender() == null || incoming.getSender().getUserId() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Sender ID is required");
        }

        String content = incoming.getMessageContent();
        if (content == null || content.trim().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Message content cannot be empty");
        }

        // Optional: cap message length to something reasonable
        if (content.length() > 1000) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Message is too long");
        }

        // Load match + sender from database (don’t trust raw IDs blindly)
        Match match = matchRepo.findById(incoming.getMatch().getMatchId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Match not found"));

        User sender = userRepo.findById(incoming.getSender().getUserId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Sender user not found"));

        // Create a new Message entity and set server-controlled fields
        Message message = new Message();
        message.setMatch(match);
        message.setSender(sender);
        message.setMessageContent(content.trim());
        message.setIsRead(false);
        message.setSentAt(LocalDateTime.now());

        return messageRepo.save(message);
    }

    // Mark message as read
    @PutMapping("/{id}/read")
    public Message markAsRead(@PathVariable Long id) {
        Message msg = messageRepo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Message not found"));
        msg.setIsRead(true);
        return messageRepo.save(msg);
    }
}