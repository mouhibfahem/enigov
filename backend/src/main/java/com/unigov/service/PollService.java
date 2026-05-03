package com.unigov.service;

import com.unigov.dto.PollDtos.*;
import com.unigov.entity.Notification.NotificationType;
import com.unigov.entity.Poll;
import com.unigov.entity.PollOption;
import com.unigov.entity.User;
import com.unigov.repository.PollRepository;
import com.unigov.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class PollService {

    @Autowired
    private PollRepository pollRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private NotificationService notificationService;

    @Transactional
    public PollResponse createPoll(PollRequest request, String username) {
        User creator = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

        if (request.getOptions() == null || request.getOptions().size() < 2) {
            throw new RuntimeException("Un sondage doit avoir au moins 2 options");
        }

        Poll poll = new Poll();
        poll.setQuestion(request.getQuestion());
        poll.setDeadline(request.getDeadline());
        poll.setCreatorId(creator.getId());
        poll.setCreatorName(creator.getFullName());

        List<String> requestedOptions = request.getOptions();
        List<PollOption> options = new ArrayList<>();
        for (int i = 0; i < requestedOptions.size(); i++) {
            PollOption option = new PollOption(requestedOptions.get(i));
            option.setPoll(poll);
            option.setOptionIndex(i);
            options.add(option);
        }
        poll.setOptions(options);

        Poll saved = pollRepository.save(poll);

        notificationService.notifyAllStudents(
                NotificationType.NEW_POLL,
                "Nouveau sondage : " + saved.getQuestion(),
                saved.getId()
        );

        return mapToResponse(saved, creator.getId(), true);
    }

    @Transactional(readOnly = true)
    public List<PollResponse> getAllPolls(String username, boolean isDelegue) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));
        return pollRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(p -> mapToResponse(p, user.getId(), isDelegue))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public PollResponse getById(String id, String username, boolean isDelegue) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));
        Poll poll = pollRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Sondage non trouvé"));
        return mapToResponse(poll, user.getId(), isDelegue);
    }

    @Transactional
    public PollResponse vote(String pollId, VoteRequest voteRequest, String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));
        Poll poll = pollRepository.findById(pollId)
                .orElseThrow(() -> new RuntimeException("Sondage non trouvé"));

        if (!poll.isActive()) {
            throw new RuntimeException("Ce sondage est clôturé");
        }

        if (poll.getDeadline() != null && java.time.LocalDateTime.now().isAfter(poll.getDeadline())) {
            throw new RuntimeException("La date limite de ce sondage est dépassée");
        }

        if (poll.hasUserVoted(user.getId())) {
            throw new RuntimeException("Vous avez déjà voté pour ce sondage");
        }

        int index = voteRequest.getOptionIndex();
        if (index < 0 || index >= poll.getOptions().size()) {
            throw new RuntimeException("Option invalide");
        }

        poll.getOptions().get(index).getVoterIds().add(user.getId());
        Poll saved = pollRepository.save(poll);
        return mapToResponse(saved, user.getId(), false);
    }

    @Transactional
    public PollResponse closePoll(String id) {
        Poll poll = pollRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Sondage non trouvé"));
        poll.setActive(false);
        Poll saved = pollRepository.save(poll);
        return mapToResponse(saved, null, true);
    }

    @Transactional
    public void deletePoll(String id) {
        Poll poll = pollRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Sondage non trouvé"));
        pollRepository.delete(poll);
    }

    private PollResponse mapToResponse(Poll poll, String currentUserId, boolean isDelegue) {
        int totalVotes = poll.getTotalVotes();

        // Collect all voter IDs if delegate needs names
        Map<String, String> voterIdToName = new HashMap<>();
        if (isDelegue) {
            Set<String> allVoterIds = new HashSet<>();
            for (PollOption opt : poll.getOptions()) {
                if (opt.getVoterIds() != null) {
                    allVoterIds.addAll(opt.getVoterIds());
                }
            }
            if (!allVoterIds.isEmpty()) {
                userRepository.findAllById(allVoterIds).forEach(u -> voterIdToName.put(u.getId(), u.getFullName()));
            }
        }

        List<OptionResponse> optionResponses = new ArrayList<>();
        for (int i = 0; i < poll.getOptions().size(); i++) {
            PollOption opt = poll.getOptions().get(i);
            int voteCount = opt.getVoterIds() != null ? opt.getVoterIds().size() : 0;

            OptionResponse or = new OptionResponse();
            or.setIndex(i);
            or.setText(opt.getText());
            or.setVoteCount(voteCount);
            or.setPercentage(totalVotes > 0 ? Math.round(voteCount * 1000.0 / totalVotes) / 10.0 : 0);

            if (isDelegue && opt.getVoterIds() != null) {
                or.setVoterNames(opt.getVoterIds().stream()
                        .map(vid -> voterIdToName.getOrDefault(vid, "Inconnu"))
                        .sorted()
                        .collect(Collectors.toList()));
            }

            optionResponses.add(or);
        }

        PollResponse response = new PollResponse();
        response.setId(poll.getId());
        response.setQuestion(poll.getQuestion());
        response.setOptions(optionResponses);
        response.setActive(poll.isActive());
        response.setDeadline(poll.getDeadline());
        response.setTotalVotes(totalVotes);
        response.setCreatedAt(poll.getCreatedAt());

        if (currentUserId != null) {
            response.setUserVoted(poll.hasUserVoted(currentUserId));
            response.setUserVotedOptionIndex(poll.getUserVotedOptionIndex(currentUserId));
        } else {
            response.setUserVotedOptionIndex(-1);
        }

        return response;
    }
}
