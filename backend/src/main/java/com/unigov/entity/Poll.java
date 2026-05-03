package com.unigov.entity;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OrderBy;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "polls")
public class Poll {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @NotBlank
    @Column(nullable = false)
    private String question;

    @OneToMany(mappedBy = "poll", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @OrderBy("optionIndex ASC")
    private List<PollOption> options = new ArrayList<>();

    private LocalDateTime deadline;

    @Column(name = "is_active", nullable = false)
    private boolean active = true;

    private String creatorId;

    private String creatorName;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    public Poll() {
        this.createdAt = LocalDateTime.now();
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getQuestion() { return question; }
    public void setQuestion(String question) { this.question = question; }
    public List<PollOption> getOptions() { return options; }
    public void setOptions(List<PollOption> options) { this.options = options; }
    public LocalDateTime getDeadline() { return deadline; }
    public void setDeadline(LocalDateTime deadline) { this.deadline = deadline; }
    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }
    public String getCreatorId() { return creatorId; }
    public void setCreatorId(String creatorId) { this.creatorId = creatorId; }
    public String getCreatorName() { return creatorName; }
    public void setCreatorName(String creatorName) { this.creatorName = creatorName; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public int getTotalVotes() {
        return options.stream().mapToInt(o -> o.getVoterIds() != null ? o.getVoterIds().size() : 0).sum();
    }

    public boolean hasUserVoted(String userId) {
        return options.stream().anyMatch(o -> o.getVoterIds() != null && o.getVoterIds().contains(userId));
    }

    public int getUserVotedOptionIndex(String userId) {
        for (int i = 0; i < options.size(); i++) {
            if (options.get(i).getVoterIds() != null && options.get(i).getVoterIds().contains(userId)) {
                return i;
            }
        }
        return -1;
    }
}
