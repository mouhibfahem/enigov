package com.unigov.service;

import com.unigov.dto.DecisionDtos.*;
import com.unigov.entity.Complaint;
import com.unigov.entity.Decision;
import com.unigov.entity.Decision.SourceType;
import com.unigov.entity.Notification.NotificationType;
import com.unigov.entity.Poll;
import com.unigov.repository.ComplaintRepository;
import com.unigov.repository.DecisionRepository;
import com.unigov.repository.PollRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class DecisionService {

    @Autowired
    private DecisionRepository decisionRepository;

    @Autowired
    private ComplaintRepository complaintRepository;

    @Autowired
    private PollRepository pollRepository;

    @Autowired
    private NotificationService notificationService;

    public DecisionResponse createDecision(DecisionRequest request) {
        Decision decision = new Decision();
        decision.setTitle(request.getTitle());
        decision.setContent(request.getContent());
        decision.setSourceType(request.getSourceType());
        decision.setSourceId(request.getSourceId());

        Decision saved = decisionRepository.save(decision);

        notificationService.notifyAllStudents(
                NotificationType.NEW_DECISION,
                "Nouvelle décision : " + saved.getTitle(),
                saved.getId()
        );

        return mapToResponse(saved);
    }

    public List<DecisionResponse> getAllDecisions() {
        return decisionRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public DecisionResponse getById(String id) {
        Decision decision = decisionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Décision non trouvée"));
        return mapToResponse(decision);
    }

    public void deleteDecision(String id) {
        Decision decision = decisionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Décision non trouvée"));
        decisionRepository.delete(decision);
    }

    private DecisionResponse mapToResponse(Decision d) {
        DecisionResponse response = new DecisionResponse();
        response.setId(d.getId());
        response.setTitle(d.getTitle());
        response.setContent(d.getContent());
        response.setSourceType(d.getSourceType());
        response.setSourceId(d.getSourceId());
        response.setCreatedAt(d.getCreatedAt());

        // Resolve source title
        if (d.getSourceType() != null && d.getSourceId() != null) {
            try {
                if (d.getSourceType() == SourceType.COMPLAINT) {
                    complaintRepository.findById(d.getSourceId())
                            .ifPresent(c -> response.setSourceTitle(c.getTitle()));
                } else if (d.getSourceType() == SourceType.POLL) {
                    pollRepository.findById(d.getSourceId())
                            .ifPresent(p -> response.setSourceTitle(p.getQuestion()));
                }
            } catch (Exception e) {
                // Source may have been deleted
            }
        }

        return response;
    }
}
