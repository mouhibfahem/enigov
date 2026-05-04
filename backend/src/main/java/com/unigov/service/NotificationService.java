package com.unigov.service;

import com.unigov.dto.NotificationDtos.*;
import com.unigov.entity.Filiere;
import com.unigov.entity.Notification;
import com.unigov.entity.Notification.NotificationType;
import com.unigov.entity.Promotion;
import com.unigov.entity.Role;
import com.unigov.entity.User;
import com.unigov.repository.NotificationRepository;
import com.unigov.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class NotificationService {

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private UserRepository userRepository;

    // --- Trigger methods (called from other services) ---

    public void notifyAllStudents(NotificationType type, String message, String referenceId) {
        List<User> students = userRepository.findByRole(Role.ROLE_ETUDIANT);
        for (User student : students) {
            createNotification(student.getId(), type, message, referenceId);
        }
    }

    /**
     * Notify students matching the target audience criteria.
     * If targetAll is true, all students are notified.
     * Otherwise, filter by filiere and/or promotion sets.
     */
    public void notifyTargetedStudents(boolean targetAll, Set<Filiere> targetFilieres,
                                        Set<Promotion> targetPromotions,
                                        NotificationType type, String message, String referenceId) {
        if (targetAll) {
            notifyAllStudents(type, message, referenceId);
            return;
        }

        List<User> students;
        boolean hasFilieres = targetFilieres != null && !targetFilieres.isEmpty();
        boolean hasPromotions = targetPromotions != null && !targetPromotions.isEmpty();

        if (hasFilieres && hasPromotions) {
            students = userRepository.findByRoleAndFiliereInAndPromotionIn(
                    Role.ROLE_ETUDIANT, targetFilieres, targetPromotions);
        } else if (hasFilieres) {
            students = userRepository.findByRoleAndFiliereIn(Role.ROLE_ETUDIANT, targetFilieres);
        } else if (hasPromotions) {
            students = userRepository.findByRoleAndPromotionIn(Role.ROLE_ETUDIANT, targetPromotions);
        } else {
            // No targeting criteria with targetAll=false — treat as all
            students = userRepository.findByRole(Role.ROLE_ETUDIANT);
        }

        for (User student : students) {
            createNotification(student.getId(), type, message, referenceId);
        }
    }

    public void notifyUser(String userId, NotificationType type, String message, String referenceId) {
        createNotification(userId, type, message, referenceId);
    }

    // --- CRUD ---

    public List<NotificationResponse> getUserNotifications(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(user.getId()).stream()
                .limit(50)
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public long getUnreadCount(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));
        return notificationRepository.countByUserIdAndIsReadFalse(user.getId());
    }

    public void markAsRead(String notificationId, String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification non trouvée"));

        if (!notification.getUserId().equals(user.getId())) {
            throw new RuntimeException("Non autorisé");
        }

        notification.setRead(true);
        notificationRepository.save(notification);
    }

    public void markAllAsRead(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));
        List<Notification> unread = notificationRepository.findByUserIdAndIsReadFalse(user.getId());
        unread.forEach(n -> n.setRead(true));
        notificationRepository.saveAll(unread);
    }

    // --- Private helpers ---

    private void createNotification(String userId, NotificationType type, String message, String referenceId) {
        Notification n = new Notification();
        n.setUserId(userId);
        n.setType(type);
        n.setMessage(message);
        n.setReferenceId(referenceId);
        notificationRepository.save(n);
    }

    private NotificationResponse mapToResponse(Notification n) {
        NotificationResponse r = new NotificationResponse();
        r.setId(n.getId());
        r.setType(n.getType() != null ? n.getType().name() : null);
        r.setMessage(n.getMessage());
        r.setReferenceId(n.getReferenceId());
        r.setRead(n.isRead());
        r.setCreatedAt(n.getCreatedAt());
        return r;
    }
}
