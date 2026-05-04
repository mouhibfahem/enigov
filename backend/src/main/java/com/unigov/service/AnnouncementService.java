package com.unigov.service;

import com.unigov.dto.AnnouncementDtos.*;
import com.unigov.entity.Announcement;
import com.unigov.entity.Filiere;
import com.unigov.entity.Notification.NotificationType;
import com.unigov.entity.Promotion;
import com.unigov.entity.Role;
import com.unigov.entity.User;
import com.unigov.repository.AnnouncementRepository;
import com.unigov.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class AnnouncementService {

    @Autowired
    private AnnouncementRepository announcementRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private NotificationService notificationService;

    @Value("${file.upload-dir:uploads}")
    private String uploadDir;

    public AnnouncementResponse createAnnouncement(AnnouncementRequest request, String username,
                                                     String attachmentPath,
                                                     boolean targetAll,
                                                     Set<Filiere> targetFilieres,
                                                     Set<Promotion> targetPromotions) {
        User delegate = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

        Announcement announcement = new Announcement();
        announcement.setTitle(request.getTitle());
        announcement.setContent(request.getContent());
        announcement.setDelegateId(delegate.getId());
        announcement.setDelegateName(delegate.getFullName());
        announcement.setAttachmentPath(attachmentPath);
        announcement.setTargetAll(targetAll);
        announcement.setTargetFilieres(targetFilieres != null ? targetFilieres : new HashSet<>());
        announcement.setTargetPromotions(targetPromotions != null ? targetPromotions : new HashSet<>());

        Announcement saved = announcementRepository.save(announcement);

        // Send targeted notifications
        notificationService.notifyTargetedStudents(
                targetAll,
                saved.getTargetFilieres(),
                saved.getTargetPromotions(),
                NotificationType.NEW_ANNOUNCEMENT,
                "Nouvelle annonce : " + saved.getTitle(),
                saved.getId()
        );

        return mapToResponse(saved);
    }

    public List<AnnouncementResponse> getAllAnnouncements(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

        List<Announcement> all = announcementRepository.findAllByOrderByCreatedAtDesc();

        // Delegates see everything
        if (user.getRole() == Role.ROLE_DELEGUE) {
            return all.stream().map(this::mapToResponse).collect(Collectors.toList());
        }

        // Students see only announcements targeted to them
        return all.stream()
                .filter(a -> a.isVisibleTo(user.getFiliere(), user.getPromotion()))
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public AnnouncementResponse getById(String id) {
        Announcement announcement = announcementRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Annonce non trouvée"));
        return mapToResponse(announcement);
    }

    public void deleteAnnouncement(String id) {
        Announcement announcement = announcementRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Annonce non trouvée"));

        if (announcement.getAttachmentPath() != null) {
            try {
                java.nio.file.Path rootLocation = java.nio.file.Paths.get(uploadDir).toAbsolutePath().normalize();
                java.nio.file.Path filePath = rootLocation.resolve(announcement.getAttachmentPath()).normalize();
                java.nio.file.Files.deleteIfExists(filePath);
            } catch (java.io.IOException e) {
                // Log but don't fail
            }
        }
        announcementRepository.delete(announcement);
    }

    private AnnouncementResponse mapToResponse(Announcement a) {
        AnnouncementResponse response = new AnnouncementResponse();
        response.setId(a.getId());
        response.setTitle(a.getTitle());
        response.setContent(a.getContent());
        response.setAttachmentPath(a.getAttachmentPath());
        response.setDelegateName(a.getDelegateName());
        response.setCreatedAt(a.getCreatedAt());
        response.setTargetAll(a.isTargetAll());
        response.setTargetFilieres(a.getTargetFilieres().stream()
                .map(Enum::name)
                .collect(Collectors.toList()));
        response.setTargetPromotions(a.getTargetPromotions().stream()
                .map(Enum::name)
                .collect(Collectors.toList()));
        response.setTargetLabel(buildTargetLabel(a));
        return response;
    }

    private String buildTargetLabel(Announcement a) {
        if (a.isTargetAll()) return "Toutes les filières";

        StringBuilder sb = new StringBuilder();
        if (!a.getTargetFilieres().isEmpty()) {
            sb.append(a.getTargetFilieres().stream()
                    .map(Filiere::getDisplayName)
                    .collect(Collectors.joining(", ")));
        }
        if (!a.getTargetPromotions().isEmpty()) {
            if (sb.length() > 0) sb.append(" · ");
            sb.append(a.getTargetPromotions().stream()
                    .map(Promotion::getDisplayName)
                    .collect(Collectors.joining(", ")));
        }
        return sb.length() > 0 ? sb.toString() : "Toutes les filières";
    }
}
