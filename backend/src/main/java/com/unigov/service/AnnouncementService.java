package com.unigov.service;

import com.unigov.dto.AnnouncementDtos.*;
import com.unigov.entity.Announcement;
import com.unigov.entity.Notification.NotificationType;
import com.unigov.entity.User;
import com.unigov.repository.AnnouncementRepository;
import com.unigov.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.List;
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

    public AnnouncementResponse createAnnouncement(AnnouncementRequest request, String username, String attachmentPath) {
        User delegate = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

        Announcement announcement = new Announcement();
        announcement.setTitle(request.getTitle());
        announcement.setContent(request.getContent());
        announcement.setDelegateId(delegate.getId());
        announcement.setDelegateName(delegate.getFullName());
        announcement.setAttachmentPath(attachmentPath);

        Announcement saved = announcementRepository.save(announcement);

        notificationService.notifyAllStudents(
                NotificationType.NEW_ANNOUNCEMENT,
                "Nouvelle annonce : " + saved.getTitle(),
                saved.getId()
        );

        return mapToResponse(saved);
    }

    public List<AnnouncementResponse> getAllAnnouncements() {
        return announcementRepository.findAllByOrderByCreatedAtDesc().stream()
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
        return response;
    }
}
