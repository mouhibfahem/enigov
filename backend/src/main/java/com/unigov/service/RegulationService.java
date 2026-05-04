package com.unigov.service;

import com.unigov.dto.RegulationDtos.*;
import com.unigov.entity.Regulation;
import com.unigov.repository.RegulationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class RegulationService {

    @Autowired
    private RegulationRepository regulationRepository;

    public RegulationResponse createRegulation(RegulationRequest request, String fileUrl) {
        Regulation regulation = new Regulation();
        regulation.setTitle(request.getTitle());
        regulation.setDescription(request.getDescription());
        regulation.setFilePath(fileUrl); // URL Cloudinary

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
        // La suppression sur Cloudinary peut être ajoutée ici si nécessaire
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
