package com.unigov.dto;

import java.time.LocalDateTime;
import java.util.List;

public class PollDtos {

    public static class PollRequest {
        private String question;
        private List<String> options;
        private LocalDateTime deadline;

        public String getQuestion() { return question; }
        public void setQuestion(String question) { this.question = question; }
        public List<String> getOptions() { return options; }
        public void setOptions(List<String> options) { this.options = options; }
        public LocalDateTime getDeadline() { return deadline; }
        public void setDeadline(LocalDateTime deadline) { this.deadline = deadline; }
    }

    public static class VoteRequest {
        private int optionIndex;

        public int getOptionIndex() { return optionIndex; }
        public void setOptionIndex(int optionIndex) { this.optionIndex = optionIndex; }
    }

    public static class PollResponse {
        private String id;
        private String question;
        private List<OptionResponse> options;
        private boolean active;
        private LocalDateTime deadline;
        private int totalVotes;
        private boolean userVoted;
        private int userVotedOptionIndex; // -1 if not voted
        private LocalDateTime createdAt;

        public String getId() { return id; }
        public void setId(String id) { this.id = id; }
        public String getQuestion() { return question; }
        public void setQuestion(String question) { this.question = question; }
        public List<OptionResponse> getOptions() { return options; }
        public void setOptions(List<OptionResponse> options) { this.options = options; }
        public boolean isActive() { return active; }
        public void setActive(boolean active) { this.active = active; }
        public LocalDateTime getDeadline() { return deadline; }
        public void setDeadline(LocalDateTime deadline) { this.deadline = deadline; }
        public int getTotalVotes() { return totalVotes; }
        public void setTotalVotes(int totalVotes) { this.totalVotes = totalVotes; }
        public boolean isUserVoted() { return userVoted; }
        public void setUserVoted(boolean userVoted) { this.userVoted = userVoted; }
        public int getUserVotedOptionIndex() { return userVotedOptionIndex; }
        public void setUserVotedOptionIndex(int userVotedOptionIndex) { this.userVotedOptionIndex = userVotedOptionIndex; }
        public LocalDateTime getCreatedAt() { return createdAt; }
        public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    }

    public static class OptionResponse {
        private int index;
        private String text;
        private int voteCount;
        private double percentage;
        private List<String> voterNames; // only populated for delegate

        public int getIndex() { return index; }
        public void setIndex(int index) { this.index = index; }
        public String getText() { return text; }
        public void setText(String text) { this.text = text; }
        public int getVoteCount() { return voteCount; }
        public void setVoteCount(int voteCount) { this.voteCount = voteCount; }
        public double getPercentage() { return percentage; }
        public void setPercentage(double percentage) { this.percentage = percentage; }
        public List<String> getVoterNames() { return voterNames; }
        public void setVoterNames(List<String> voterNames) { this.voterNames = voterNames; }
    }
}
