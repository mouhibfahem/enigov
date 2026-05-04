package com.unigov.dto;

import java.time.LocalDateTime;

public class EventDtos {

    public static class EventRequest {
        private String title;
        private String description;
        private LocalDateTime date;
        private String location;
        private String type;

        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        public LocalDateTime getDate() { return date; }
        public void setDate(LocalDateTime date) { this.date = date; }
        public String getLocation() { return location; }
        public void setLocation(String location) { this.location = location; }
        public String getType() { return type; }
        public void setType(String type) { this.type = type; }
    }

    public static class EventResponse {
        private String id;
        private String title;
        private String description;
        private LocalDateTime date;
        private String location;
        private String type;
        private LocalDateTime createdAt;

        public String getId() { return id; }
        public void setId(String id) { this.id = id; }
        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        public LocalDateTime getDate() { return date; }
        public void setDate(LocalDateTime date) { this.date = date; }
        public String getLocation() { return location; }
        public void setLocation(String location) { this.location = location; }
        public String getType() { return type; }
        public void setType(String type) { this.type = type; }
        public LocalDateTime getCreatedAt() { return createdAt; }
        public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    }
}
