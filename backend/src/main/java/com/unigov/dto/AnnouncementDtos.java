package com.unigov.dto;

import java.time.LocalDateTime;
import java.util.List;

public class AnnouncementDtos {

    public static class AnnouncementRequest {
        private String title;
        private String content;

        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }
        public String getContent() { return content; }
        public void setContent(String content) { this.content = content; }
    }

    public static class AnnouncementResponse {
        private String id;
        private String title;
        private String content;
        private String attachmentPath;
        private String delegateName;
        private LocalDateTime createdAt;
        private boolean targetAll;
        private List<String> targetFilieres;
        private List<String> targetPromotions;
        private String targetLabel;

        public String getId() { return id; }
        public void setId(String id) { this.id = id; }
        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }
        public String getContent() { return content; }
        public void setContent(String content) { this.content = content; }
        public String getAttachmentPath() { return attachmentPath; }
        public void setAttachmentPath(String attachmentPath) { this.attachmentPath = attachmentPath; }
        public String getDelegateName() { return delegateName; }
        public void setDelegateName(String delegateName) { this.delegateName = delegateName; }
        public LocalDateTime getCreatedAt() { return createdAt; }
        public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
        public boolean isTargetAll() { return targetAll; }
        public void setTargetAll(boolean targetAll) { this.targetAll = targetAll; }
        public List<String> getTargetFilieres() { return targetFilieres; }
        public void setTargetFilieres(List<String> targetFilieres) { this.targetFilieres = targetFilieres; }
        public List<String> getTargetPromotions() { return targetPromotions; }
        public void setTargetPromotions(List<String> targetPromotions) { this.targetPromotions = targetPromotions; }
        public String getTargetLabel() { return targetLabel; }
        public void setTargetLabel(String targetLabel) { this.targetLabel = targetLabel; }
    }
}
