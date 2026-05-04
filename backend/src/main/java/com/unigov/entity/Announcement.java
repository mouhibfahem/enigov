package com.unigov.entity;

import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "announcements")
public class Announcement {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @NotBlank
    @Column(nullable = false)
    private String title;

    @NotBlank
    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    private String attachmentPath;

    private String delegateId;

    private String delegateName;

    @Column(nullable = false)
    private boolean targetAll = true;

    @ElementCollection(targetClass = Filiere.class, fetch = FetchType.EAGER)
    @CollectionTable(name = "announcement_target_filieres", joinColumns = @JoinColumn(name = "announcement_id"))
    @Enumerated(EnumType.STRING)
    @Column(name = "filiere")
    private Set<Filiere> targetFilieres = new HashSet<>();

    @ElementCollection(targetClass = Promotion.class, fetch = FetchType.EAGER)
    @CollectionTable(name = "announcement_target_promotions", joinColumns = @JoinColumn(name = "announcement_id"))
    @Enumerated(EnumType.STRING)
    @Column(name = "promotion")
    private Set<Promotion> targetPromotions = new HashSet<>();

    @Column(nullable = false)
    private LocalDateTime createdAt;

    public Announcement() {
        this.createdAt = LocalDateTime.now();
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
    public String getAttachmentPath() { return attachmentPath; }
    public void setAttachmentPath(String attachmentPath) { this.attachmentPath = attachmentPath; }
    public String getDelegateId() { return delegateId; }
    public void setDelegateId(String delegateId) { this.delegateId = delegateId; }
    public String getDelegateName() { return delegateName; }
    public void setDelegateName(String delegateName) { this.delegateName = delegateName; }
    public boolean isTargetAll() { return targetAll; }
    public void setTargetAll(boolean targetAll) { this.targetAll = targetAll; }
    public Set<Filiere> getTargetFilieres() { return targetFilieres; }
    public void setTargetFilieres(Set<Filiere> targetFilieres) { this.targetFilieres = targetFilieres; }
    public Set<Promotion> getTargetPromotions() { return targetPromotions; }
    public void setTargetPromotions(Set<Promotion> targetPromotions) { this.targetPromotions = targetPromotions; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    /**
     * Check if a user with given filiere/promotion is in the target audience.
     * Rules: if targetAll=true, everyone sees it. Otherwise, user must match
     * at least one targeted filiere (if any specified) AND one targeted promotion (if any specified).
     * Empty sets mean "no filter on that axis".
     */
    public boolean isVisibleTo(Filiere userFiliere, Promotion userPromotion) {
        if (targetAll) return true;
        // If user has no filiere/promotion (e.g. old accounts), show everything
        if (userFiliere == null && userPromotion == null) return true;

        boolean filiereMatch = targetFilieres.isEmpty() || (userFiliere != null && targetFilieres.contains(userFiliere));
        boolean promotionMatch = targetPromotions.isEmpty() || (userPromotion != null && targetPromotions.contains(userPromotion));
        return filiereMatch && promotionMatch;
    }
}

