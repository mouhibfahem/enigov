package com.unigov.controller;

import com.unigov.dto.PollDtos.*;
import com.unigov.entity.Role;
import com.unigov.entity.User;
import com.unigov.repository.UserRepository;
import com.unigov.service.PollService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/polls")
public class PollController {

    @Autowired
    private PollService pollService;

    @Autowired
    private UserRepository userRepository;

    @PostMapping
    @PreAuthorize("hasAuthority('ROLE_DELEGUE')")
    public ResponseEntity<PollResponse> createPoll(@RequestBody PollRequest request, Principal principal) {
        return ResponseEntity.ok(pollService.createPoll(request, principal.getName()));
    }

    @GetMapping
    public ResponseEntity<List<PollResponse>> getAllPolls(Principal principal) {
        boolean isDelegue = isDelegue(principal.getName());
        return ResponseEntity.ok(pollService.getAllPolls(principal.getName(), isDelegue));
    }

    @GetMapping("/{id}")
    public ResponseEntity<PollResponse> getPoll(@PathVariable String id, Principal principal) {
        boolean isDelegue = isDelegue(principal.getName());
        return ResponseEntity.ok(pollService.getById(id, principal.getName(), isDelegue));
    }

    @PostMapping("/{id}/vote")
    @PreAuthorize("hasAuthority('ROLE_ETUDIANT')")
    public ResponseEntity<PollResponse> vote(@PathVariable String id, @RequestBody VoteRequest request, Principal principal) {
        return ResponseEntity.ok(pollService.vote(id, request, principal.getName()));
    }

    @PutMapping("/{id}/close")
    @PreAuthorize("hasAuthority('ROLE_DELEGUE')")
    public ResponseEntity<PollResponse> closePoll(@PathVariable String id) {
        return ResponseEntity.ok(pollService.closePoll(id));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_DELEGUE')")
    public ResponseEntity<?> deletePoll(@PathVariable String id) {
        pollService.deletePoll(id);
        return ResponseEntity.ok().build();
    }

    private boolean isDelegue(String username) {
        return userRepository.findByUsername(username)
                .map(u -> u.getRole() == Role.ROLE_DELEGUE)
                .orElse(false);
    }
}
