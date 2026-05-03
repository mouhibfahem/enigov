package com.unigov.controller;

import com.unigov.entity.ComplaintEnums.ComplaintStatus;
import com.unigov.entity.Role;
import com.unigov.entity.User;
import com.unigov.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/stats")
public class StatsController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ComplaintRepository complaintRepository;

    @Autowired
    private PollRepository pollRepository;

    @Autowired
    private AnnouncementRepository announcementRepository;

    @Autowired
    private EventRepository eventRepository;

    @Autowired
    private DecisionRepository decisionRepository;

    @Autowired
    private MessageRepository messageRepository;

    @GetMapping
    @PreAuthorize("hasAuthority('ROLE_DELEGUE')")
    public ResponseEntity<Map<String, Object>> getDashboardStats(Authentication auth) {
        User delegate = userRepository.findByUsername(auth.getName())
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

        Map<String, Object> stats = new HashMap<>();

        // User stats
        long totalStudents = userRepository.findByRole(Role.ROLE_ETUDIANT).size();
        stats.put("totalStudents", totalStudents);

        // Complaint stats
        var allComplaints = complaintRepository.findAll();
        stats.put("totalComplaints", allComplaints.size());
        stats.put("pendingComplaints", allComplaints.stream().filter(c -> c.getStatus() == ComplaintStatus.PENDING).count());
        stats.put("inProgressComplaints", allComplaints.stream().filter(c -> c.getStatus() == ComplaintStatus.IN_PROGRESS).count());
        stats.put("resolvedComplaints", allComplaints.stream().filter(c -> c.getStatus() == ComplaintStatus.RESOLVED).count());
        stats.put("rejectedComplaints", allComplaints.stream().filter(c -> c.getStatus() == ComplaintStatus.REJECTED).count());

        // Poll stats
        var allPolls = pollRepository.findAll();
        stats.put("totalPolls", allPolls.size());
        stats.put("activePolls", allPolls.stream().filter(p -> p.isActive()).count());

        // Other counts
        stats.put("totalAnnouncements", announcementRepository.count());
        stats.put("totalDecisions", decisionRepository.count());
        stats.put("upcomingEvents", eventRepository.findByDateAfterOrderByDateAsc(LocalDateTime.now()).size());

        // Unread messages for delegate
        stats.put("unreadMessages", messageRepository.countByRecipientIdAndIsReadFalse(delegate.getId()));

        return ResponseEntity.ok(stats);
    }
}
