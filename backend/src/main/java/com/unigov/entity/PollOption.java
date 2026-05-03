package com.unigov.entity;

import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

import com.fasterxml.jackson.annotation.JsonIgnore;

import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "poll_options")
public class PollOption {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "poll_id", nullable = false)
    @JsonIgnore
    private Poll poll;

    @Column(nullable = false)
    private String text;

    @Column(name = "option_index", nullable = false)
    private int optionIndex;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(
        name = "poll_option_voters",
        joinColumns = @JoinColumn(name = "option_id")
    )
    @Column(name = "user_id", nullable = false)
    private Set<String> voterIds = new HashSet<>();

    public PollOption() {}

    public PollOption(String text) {
        this.text = text;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public Poll getPoll() { return poll; }
    public void setPoll(Poll poll) { this.poll = poll; }

    public String getText() { return text; }
    public void setText(String text) { this.text = text; }

    public int getOptionIndex() { return optionIndex; }
    public void setOptionIndex(int optionIndex) { this.optionIndex = optionIndex; }

    public Set<String> getVoterIds() { return voterIds; }
    public void setVoterIds(Set<String> voterIds) { this.voterIds = voterIds; }
}
