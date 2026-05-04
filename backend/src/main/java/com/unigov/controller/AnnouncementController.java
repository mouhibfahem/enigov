package com.unigov.controller;

import com.unigov.dto.AnnouncementDtos.*;
import com.unigov.entity.Filiere;
import com.unigov.entity.Promotion;
import com.unigov.service.AnnouncementService;
import com.unigov.service.FileStorageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.security.Principal;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@RestController
@RequestMapping("/api/announcements")
public class AnnouncementController {

    @Autowired
    private AnnouncementService announcementService;

    @Autowired
    private FileStorageService fileStorageService;

    @PostMapping(consumes = {"multipart/form-data"})
    @PreAuthorize("hasAuthority('ROLE_DELEGUE')")
    public ResponseEntity<AnnouncementResponse> createAnnouncement(
            @RequestParam("title") String title,
            @RequestParam("content") String content,
            @RequestPart(value = "file", required = false) MultipartFile file,
            @RequestParam(value = "targetAll", defaultValue = "true") boolean targetAll,
            @RequestParam(value = "targetFilieres", required = false) List<String> targetFilieresStr,
            @RequestParam(value = "targetPromotions", required = false) List<String> targetPromotionsStr,
            Principal principal) {

        AnnouncementRequest request = new AnnouncementRequest();
        request.setTitle(title);
        request.setContent(content);

        String attachmentPath = null;
        if (file != null && !file.isEmpty()) {
            attachmentPath = fileStorageService.storeFile(file);
        }

        // Parse target audience
        Set<Filiere> targetFilieres = new HashSet<>();
        if (targetFilieresStr != null) {
            for (String f : targetFilieresStr) {
                try { targetFilieres.add(Filiere.valueOf(f.toUpperCase())); } catch (Exception ignored) {}
            }
        }

        Set<Promotion> targetPromotions = new HashSet<>();
        if (targetPromotionsStr != null) {
            for (String p : targetPromotionsStr) {
                try { targetPromotions.add(Promotion.valueOf(p.toUpperCase())); } catch (Exception ignored) {}
            }
        }

        return ResponseEntity.ok(announcementService.createAnnouncement(
                request, principal.getName(), attachmentPath, targetAll, targetFilieres, targetPromotions));
    }

    @GetMapping
    public ResponseEntity<List<AnnouncementResponse>> getAllAnnouncements(Principal principal) {
        return ResponseEntity.ok(announcementService.getAllAnnouncements(principal.getName()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<AnnouncementResponse> getAnnouncement(@PathVariable String id) {
        return ResponseEntity.ok(announcementService.getById(id));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_DELEGUE')")
    public ResponseEntity<?> deleteAnnouncement(@PathVariable String id) {
        announcementService.deleteAnnouncement(id);
        return ResponseEntity.ok().build();
    }
}
