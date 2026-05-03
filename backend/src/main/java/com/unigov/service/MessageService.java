package com.unigov.service;

import com.unigov.dto.MessageDtos.*;
import com.unigov.entity.Message;
import com.unigov.entity.Notification.NotificationType;
import com.unigov.entity.Role;
import com.unigov.entity.User;
import com.unigov.repository.MessageRepository;
import com.unigov.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class MessageService {

    @Autowired
    private MessageRepository messageRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private NotificationService notificationService;

    @Transactional
    public MessageResponse sendMessage(MessageRequest request, String senderUsername) {
        User sender = userRepository.findByUsername(senderUsername)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));
        User recipient = userRepository.findById(request.getRecipientId())
                .orElseThrow(() -> new RuntimeException("Destinataire non trouvé"));

        // Enforce: students can only message delegate
        if (sender.getRole() == Role.ROLE_ETUDIANT && recipient.getRole() == Role.ROLE_ETUDIANT) {
            throw new RuntimeException("Les étudiants ne peuvent envoyer des messages qu'au délégué");
        }

        Message message = new Message();
        message.setSenderId(sender.getId());
        message.setSenderName(sender.getFullName());
        message.setRecipientId(recipient.getId());
        message.setRecipientName(recipient.getFullName());
        message.setContent(request.getContent());

        Message saved = messageRepository.save(message);

        notificationService.notifyUser(
                recipient.getId(),
                NotificationType.NEW_MESSAGE,
                "Nouveau message de " + sender.getFullName(),
                saved.getId()
        );

        return mapToResponse(saved);
    }

    @Transactional
    public List<MessageResponse> getConversation(String otherUserId, String currentUsername) {
        User currentUser = userRepository.findByUsername(currentUsername)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

        List<Message> messages = messageRepository.findConversation(currentUser.getId(), otherUserId);

        // Mark unread messages as read
        List<Message> unread = messages.stream()
                .filter(m -> m.getRecipientId().equals(currentUser.getId()) && !m.isRead())
                .collect(Collectors.toList());
        if (!unread.isEmpty()) {
            unread.forEach(m -> m.setRead(true));
            messageRepository.saveAll(unread);
        }

        // Sort by timestamp ascending for chat display
        messages.sort(Comparator.comparing(Message::getTimestamp));

        return messages.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    public List<ConversationResponse> getConversations(String currentUsername) {
        User currentUser = userRepository.findByUsername(currentUsername)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

        String userId = currentUser.getId();

        // Get all messages involving current user
        List<Message> userMessages = messageRepository
                .findBySenderIdOrRecipientIdOrderByTimestampDesc(userId, userId);

        // Group by other participant
        Map<String, List<Message>> grouped = new LinkedHashMap<>();
        for (Message m : userMessages) {
            String otherId = m.getSenderId().equals(userId) ? m.getRecipientId() : m.getSenderId();
            grouped.computeIfAbsent(otherId, k -> new ArrayList<>()).add(m);
        }

        // Build conversation responses
        List<ConversationResponse> conversations = new ArrayList<>();
        for (Map.Entry<String, List<Message>> entry : grouped.entrySet()) {
            String otherId = entry.getKey();
            List<Message> msgs = entry.getValue();
            Message lastMsg = msgs.get(0); // already sorted desc

            String otherName = lastMsg.getSenderId().equals(userId)
                    ? lastMsg.getRecipientName()
                    : lastMsg.getSenderName();

            long unreadCount = messageRepository.countByRecipientIdAndSenderIdAndIsReadFalse(userId, otherId);

            ConversationResponse conv = new ConversationResponse();
            conv.setOtherUserId(otherId);
            conv.setOtherUserName(otherName);
            conv.setLastMessage(lastMsg.getContent());
            conv.setLastTimestamp(lastMsg.getTimestamp());
            conv.setUnreadCount(unreadCount);
            userRepository.findById(otherId).ifPresent(u -> conv.setProfilePhoto(u.getProfilePhoto()));
            conversations.add(conv);
        }

        return conversations;
    }

    public List<ContactResponse> getAvailableContacts(String currentUsername) {
        User currentUser = userRepository.findByUsername(currentUsername)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

        List<User> contacts;
        if (currentUser.getRole() == Role.ROLE_ETUDIANT) {
            // Students can only contact the delegate
            contacts = userRepository.findAll().stream()
                    .filter(u -> u.getRole() == Role.ROLE_DELEGUE)
                    .collect(Collectors.toList());
        } else {
            // Delegate can contact all students
            contacts = userRepository.findAll().stream()
                    .filter(u -> !u.getId().equals(currentUser.getId()))
                    .collect(Collectors.toList());
        }

        return contacts.stream().map(u -> {
            ContactResponse c = new ContactResponse();
            c.setId(u.getId());
            c.setFullName(u.getFullName());
            c.setRole(u.getRole() != null ? u.getRole().name() : "ROLE_ETUDIANT");
            c.setProfilePhoto(u.getProfilePhoto());
            return c;
        }).collect(Collectors.toList());
    }

    private MessageResponse mapToResponse(Message m) {
        MessageResponse r = new MessageResponse();
        r.setId(m.getId());
        r.setContent(m.getContent());
        r.setSenderId(m.getSenderId());
        r.setSenderName(m.getSenderName());
        r.setRecipientId(m.getRecipientId());
        r.setRecipientName(m.getRecipientName());
        r.setTimestamp(m.getTimestamp());
        r.setRead(m.isRead());
        return r;
    }
}
