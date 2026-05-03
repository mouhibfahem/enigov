package com.unigov.controller;

import com.unigov.dto.RegulationDtos.*;
import com.unigov.service.FileStorageService;
import com.unigov.service.RegulationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/regulations")
public class RegulationController {

    @Autowired
    private RegulationService regulationService;

    @Autowired
    private FileStorageService fileStorageService;

    @PostMapping(consumes = {"multipart/form-data"})
    @PreAuthorize("hasAuthority('ROLE_DELEGUE')")
    public ResponseEntity<RegulationResponse> createRegulation(
            @RequestParam("title") String title,
            @RequestParam(value = "description", required = false) String description,
            @RequestPart("file") MultipartFile file) {

        String filePath = fileStorageService.storeFile(file);

        RegulationRequest request = new RegulationRequest();
        request.setTitle(title);
        request.setDescription(description);

        return ResponseEntity.ok(regulationService.createRegulation(request, filePath));
    }

    @GetMapping
    public ResponseEntity<List<RegulationResponse>> getAllRegulations() {
        return ResponseEntity.ok(regulationService.getAllRegulations());
    }

    @GetMapping("/{id}")
    public ResponseEntity<RegulationResponse> getRegulation(@PathVariable String id) {
        return ResponseEntity.ok(regulationService.getById(id));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_DELEGUE')")
    public ResponseEntity<?> deleteRegulation(@PathVariable String id) {
        regulationService.deleteRegulation(id);
        return ResponseEntity.ok().build();
    }
}
