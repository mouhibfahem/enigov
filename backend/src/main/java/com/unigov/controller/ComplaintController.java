package com.unigov.controller;

import com.unigov.dto.ComplaintDtos.*;
import com.unigov.service.ComplaintService;
import com.unigov.service.FileStorageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/complaints")
public class ComplaintController {

    @Autowired
    private ComplaintService complaintService;

    @Autowired
    private FileStorageService fileStorageService;

    @PostMapping(consumes = {"multipart/form-data"})
    @PreAuthorize("hasAuthority('ROLE_ETUDIANT')")
    public ResponseEntity<ComplaintResponse> createComplaint(
            @RequestParam("title") String title,
            @RequestParam("description") String description,
            @RequestParam(value = "isPublic", defaultValue = "false") boolean isPublic,
            @RequestPart(value = "file", required = false) MultipartFile file,
            Principal principal) {

        ComplaintRequest request = new ComplaintRequest();
        request.setTitle(title);
        request.setDescription(description);
        request.setPublic(isPublic);

        String attachmentPath = null;
        if (file != null && !file.isEmpty()) {
            attachmentPath = fileStorageService.storeFile(file);
        }

        return ResponseEntity.ok(complaintService.createComplaint(request, principal.getName(), attachmentPath));
    }

    @GetMapping("/my")
    @PreAuthorize("hasAuthority('ROLE_ETUDIANT')")
    public ResponseEntity<List<ComplaintResponse>> getMyComplaints(Principal principal) {
        return ResponseEntity.ok(complaintService.getMyComplaints(principal.getName()));
    }

    @GetMapping("/public")
    public ResponseEntity<List<ComplaintResponse>> getPublicComplaints(Principal principal) {
        return ResponseEntity.ok(complaintService.getPublicComplaints(principal.getName()));
    }

    @GetMapping
    @PreAuthorize("hasAuthority('ROLE_DELEGUE')")
    public ResponseEntity<List<ComplaintResponse>> getAllComplaints(Principal principal) {
        return ResponseEntity.ok(complaintService.getAllComplaints(principal.getName()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ComplaintResponse> getComplaint(@PathVariable String id, Principal principal) {
        return ResponseEntity.ok(complaintService.getById(id, principal.getName()));
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasAuthority('ROLE_DELEGUE')")
    public ResponseEntity<ComplaintResponse> updateStatus(
            @PathVariable String id,
            @RequestBody ComplaintUpdate update) {
        return ResponseEntity.ok(complaintService.updateStatus(id, update));
    }

    @PostMapping("/{id}/upvote")
    public ResponseEntity<ComplaintResponse> upvote(@PathVariable String id, Principal principal) {
        return ResponseEntity.ok(complaintService.toggleUpvote(id, principal.getName()));
    }

    @PostMapping("/{id}/downvote")
    public ResponseEntity<ComplaintResponse> downvote(@PathVariable String id, Principal principal) {
        return ResponseEntity.ok(complaintService.toggleDownvote(id, principal.getName()));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_DELEGUE')")
    public ResponseEntity<?> deleteComplaint(@PathVariable String id) {
        complaintService.deleteComplaint(id);
        return ResponseEntity.ok().build();
    }
}
