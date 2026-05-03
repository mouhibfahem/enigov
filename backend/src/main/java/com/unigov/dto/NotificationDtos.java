package com.unigov.dto;

import java.time.Instant;

public class NotificationDtos {

    public static class NotificationResponse {
        private String id;
        private String type;
        private String message;
        private String referenceId;
        private boolean isRead;
        private Instant createdAt;

        public String getId() { return id; }
        public void setId(String id) { this.id = id; }

        public String getType() { return type; }
        public void setType(String type) { this.type = type; }

        public String getMessage() { return message; }
        public void setMessage(String message) { this.message = message; }

        public String getReferenceId() { return referenceId; }
        public void setReferenceId(String referenceId) { this.referenceId = referenceId; }

        public boolean isRead() { return isRead; }
        public void setRead(boolean read) { isRead = read; }

        public Instant getCreatedAt() { return createdAt; }
        public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
    }

    public static class UnreadCountResponse {
        private long count;

        public long getCount() { return count; }
        public void setCount(long count) { this.count = count; }
    }
}
