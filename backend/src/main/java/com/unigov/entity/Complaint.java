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
@Table(name = "complaints")
public class Complaint {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @NotBlank
    @Column(nullable = false)
    private String title;

    @NotBlank
    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;

    @Column(name = "is_public", nullable = false)
    private boolean isPublic = false;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 32)
    private ComplaintEnums.ComplaintStatus status = ComplaintEnums.ComplaintStatus.PENDING;

    private String studentId;

    private String studentName;

    @Column(columnDefinition = "TEXT")
    private String delegateResponse;

    private String attachmentPath;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(
        name = "complaint_upvotes",
        joinColumns = @JoinColumn(name = "complaint_id")
    )
    @Column(name = "user_id", nullable = false)
    private Set<String> upvotes = new HashSet<>();

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(
        name = "complaint_downvotes",
        joinColumns = @JoinColumn(name = "complaint_id")
    )
    @Column(name = "user_id", nullable = false)
    private Set<String> downvotes = new HashSet<>();

    @Column(nullable = false)
    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    public Complaint() {
        this.createdAt = LocalDateTime.now();
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public boolean isPublic() { return isPublic; }
    public void setPublic(boolean isPublic) { this.isPublic = isPublic; }

    public ComplaintEnums.ComplaintStatus getStatus() { return status; }
    public void setStatus(ComplaintEnums.ComplaintStatus status) { this.status = status; }

    public String getStudentId() { return studentId; }
    public void setStudentId(String studentId) { this.studentId = studentId; }

    public String getStudentName() { return studentName; }
    public void setStudentName(String studentName) { this.studentName = studentName; }

    public String getDelegateResponse() { return delegateResponse; }
    public void setDelegateResponse(String delegateResponse) { this.delegateResponse = delegateResponse; }

    public String getAttachmentPath() { return attachmentPath; }
    public void setAttachmentPath(String attachmentPath) { this.attachmentPath = attachmentPath; }

    public Set<String> getUpvotes() { return upvotes; }
    public void setUpvotes(Set<String> upvotes) { this.upvotes = upvotes; }

    public Set<String> getDownvotes() { return downvotes; }
    public void setDownvotes(Set<String> downvotes) { this.downvotes = downvotes; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public int getVoteScore() {
        return (upvotes != null ? upvotes.size() : 0) - (downvotes != null ? downvotes.size() : 0);
    }
}
