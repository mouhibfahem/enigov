package com.unigov.service;

import com.unigov.dto.RegulationDtos.*;
import com.unigov.entity.Regulation;
import com.unigov.repository.RegulationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class RegulationService {

    @Autowired
    private RegulationRepository regulationRepository;

    @Value("${file.upload-dir:uploads}")
    private String uploadDir;

    public RegulationResponse createRegulation(RegulationRequest request, String filePath) {
        Regulation regulation = new Regulation();
        regulation.setTitle(request.getTitle());
        regulation.setDescription(request.getDescription());
        regulation.setFilePath(filePath);

        Regulation saved = regulationRepository.save(regulation);
        return mapToResponse(saved);
    }

    public List<RegulationResponse> getAllRegulations() {
        return regulationRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public RegulationResponse getById(String id) {
        Regulation regulation = regulationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Document non trouvé"));
        return mapToResponse(regulation);
    }

    public void deleteRegulation(String id) {
        Regulation regulation = regulationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Document non trouvé"));

        if (regulation.getFilePath() != null) {
            try {
                java.nio.file.Path rootLocation = java.nio.file.Paths.get(uploadDir).toAbsolutePath().normalize();
                java.nio.file.Path filePath = rootLocation.resolve(regulation.getFilePath()).normalize();
                java.nio.file.Files.deleteIfExists(filePath);
            } catch (java.io.IOException e) {
                // Log but don't fail
            }
        }
        regulationRepository.delete(regulation);
    }

    private RegulationResponse mapToResponse(Regulation r) {
        RegulationResponse response = new RegulationResponse();
        response.setId(r.getId());
        response.setTitle(r.getTitle());
        response.setDescription(r.getDescription());
        response.setFilePath(r.getFilePath());
        response.setCreatedAt(r.getCreatedAt());
        return response;
    }
}
