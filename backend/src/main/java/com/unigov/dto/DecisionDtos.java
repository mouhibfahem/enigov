package com.unigov.dto;

import com.unigov.entity.Decision.SourceType;
import java.time.LocalDateTime;

public class DecisionDtos {

    public static class DecisionRequest {
        private String title;
        private String content;
        private SourceType sourceType;
        private String sourceId;

        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }
        public String getContent() { return content; }
        public void setContent(String content) { this.content = content; }
        public SourceType getSourceType() { return sourceType; }
        public void setSourceType(SourceType sourceType) { this.sourceType = sourceType; }
        public String getSourceId() { return sourceId; }
        public void setSourceId(String sourceId) { this.sourceId = sourceId; }
    }

    public static class DecisionResponse {
        private String id;
        private String title;
        private String content;
        private SourceType sourceType;
        private String sourceId;
        private String sourceTitle;
        private LocalDateTime createdAt;

        public String getId() { return id; }
        public void setId(String id) { this.id = id; }
        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }
        public String getContent() { return content; }
        public void setContent(String content) { this.content = content; }
        public SourceType getSourceType() { return sourceType; }
        public void setSourceType(SourceType sourceType) { this.sourceType = sourceType; }
        public String getSourceId() { return sourceId; }
        public void setSourceId(String sourceId) { this.sourceId = sourceId; }
        public String getSourceTitle() { return sourceTitle; }
        public void setSourceTitle(String sourceTitle) { this.sourceTitle = sourceTitle; }
        public LocalDateTime getCreatedAt() { return createdAt; }
        public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    }
}
