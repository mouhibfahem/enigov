package com.unigov.dto;

import com.unigov.entity.ComplaintEnums.ComplaintStatus;
import java.time.LocalDateTime;

public class ComplaintDtos {

    public static class ComplaintRequest {
        private String title;
        private String description;
        private boolean isPublic;

        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        public boolean isPublic() { return isPublic; }
        public void setPublic(boolean isPublic) { this.isPublic = isPublic; }
    }

    public static class ComplaintResponse {
        private String id;
        private String title;
        private String description;
        private boolean isPublic;
        private ComplaintStatus status;
        private String studentId;
        private String studentName;
        private String delegateResponse;
        private String attachmentPath;
        private int upvoteCount;
        private int downvoteCount;
        private int voteScore;
        private String userVote; // "UP", "DOWN", or null
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;

        public String getId() { return id; }
        public void setId(String id) { this.id = id; }
        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        public boolean isPublic() { return isPublic; }
        public void setPublic(boolean isPublic) { this.isPublic = isPublic; }
        public ComplaintStatus getStatus() { return status; }
        public void setStatus(ComplaintStatus status) { this.status = status; }
        public String getStudentId() { return studentId; }
        public void setStudentId(String studentId) { this.studentId = studentId; }
        public String getStudentName() { return studentName; }
        public void setStudentName(String studentName) { this.studentName = studentName; }
        public String getDelegateResponse() { return delegateResponse; }
        public void setDelegateResponse(String delegateResponse) { this.delegateResponse = delegateResponse; }
        public String getAttachmentPath() { return attachmentPath; }
        public void setAttachmentPath(String attachmentPath) { this.attachmentPath = attachmentPath; }
        public int getUpvoteCount() { return upvoteCount; }
        public void setUpvoteCount(int upvoteCount) { this.upvoteCount = upvoteCount; }
        public int getDownvoteCount() { return downvoteCount; }
        public void setDownvoteCount(int downvoteCount) { this.downvoteCount = downvoteCount; }
        public int getVoteScore() { return voteScore; }
        public void setVoteScore(int voteScore) { this.voteScore = voteScore; }
        public String getUserVote() { return userVote; }
        public void setUserVote(String userVote) { this.userVote = userVote; }
        public LocalDateTime getCreatedAt() { return createdAt; }
        public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
        public LocalDateTime getUpdatedAt() { return updatedAt; }
        public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
    }

    public static class ComplaintUpdate {
        private ComplaintStatus status;
        private String response;

        public ComplaintStatus getStatus() { return status; }
        public void setStatus(ComplaintStatus status) { this.status = status; }
        public String getResponse() { return response; }
        public void setResponse(String response) { this.response = response; }
    }
}
