package com.unigov.dto;

import java.time.LocalDateTime;

public class MessageDtos {

    public static class MessageRequest {
        private String content;
        private String recipientId;

        public String getContent() { return content; }
        public void setContent(String content) { this.content = content; }
        public String getRecipientId() { return recipientId; }
        public void setRecipientId(String recipientId) { this.recipientId = recipientId; }
    }

    public static class MessageResponse {
        private String id;
        private String content;
        private String senderId;
        private String senderName;
        private String recipientId;
        private String recipientName;
        private LocalDateTime timestamp;
        private boolean isRead;

        public String getId() { return id; }
        public void setId(String id) { this.id = id; }
        public String getContent() { return content; }
        public void setContent(String content) { this.content = content; }
        public String getSenderId() { return senderId; }
        public void setSenderId(String senderId) { this.senderId = senderId; }
        public String getSenderName() { return senderName; }
        public void setSenderName(String senderName) { this.senderName = senderName; }
        public String getRecipientId() { return recipientId; }
        public void setRecipientId(String recipientId) { this.recipientId = recipientId; }
        public String getRecipientName() { return recipientName; }
        public void setRecipientName(String recipientName) { this.recipientName = recipientName; }
        public LocalDateTime getTimestamp() { return timestamp; }
        public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }
        public boolean isRead() { return isRead; }
        public void setRead(boolean read) { isRead = read; }
    }

    public static class ConversationResponse {
        private String otherUserId;
        private String otherUserName;
        private String lastMessage;
        private LocalDateTime lastTimestamp;
        private long unreadCount;
        private String profilePhoto;

        public String getOtherUserId() { return otherUserId; }
        public void setOtherUserId(String otherUserId) { this.otherUserId = otherUserId; }
        public String getOtherUserName() { return otherUserName; }
        public void setOtherUserName(String otherUserName) { this.otherUserName = otherUserName; }
        public String getLastMessage() { return lastMessage; }
        public void setLastMessage(String lastMessage) { this.lastMessage = lastMessage; }
        public LocalDateTime getLastTimestamp() { return lastTimestamp; }
        public void setLastTimestamp(LocalDateTime lastTimestamp) { this.lastTimestamp = lastTimestamp; }
        public long getUnreadCount() { return unreadCount; }
        public void setUnreadCount(long unreadCount) { this.unreadCount = unreadCount; }
        public String getProfilePhoto() { return profilePhoto; }
        public void setProfilePhoto(String profilePhoto) { this.profilePhoto = profilePhoto; }
    }

    public static class ContactResponse {
        private String id;
        private String fullName;
        private String role;
        private String profilePhoto;

        public String getId() { return id; }
        public void setId(String id) { this.id = id; }
        public String getFullName() { return fullName; }
        public void setFullName(String fullName) { this.fullName = fullName; }
        public String getRole() { return role; }
        public void setRole(String role) { this.role = role; }
        public String getProfilePhoto() { return profilePhoto; }
        public void setProfilePhoto(String profilePhoto) { this.profilePhoto = profilePhoto; }
    }
}
