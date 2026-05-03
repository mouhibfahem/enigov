package com.unigov.controller;

import com.unigov.dto.DecisionDtos.*;
import com.unigov.service.DecisionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/decisions")
public class DecisionController {

    @Autowired
    private DecisionService decisionService;

    @PostMapping
    @PreAuthorize("hasAuthority('ROLE_DELEGUE')")
    public ResponseEntity<DecisionResponse> createDecision(@RequestBody DecisionRequest request) {
        return ResponseEntity.ok(decisionService.createDecision(request));
    }

    @GetMapping
    public ResponseEntity<List<DecisionResponse>> getAllDecisions() {
        return ResponseEntity.ok(decisionService.getAllDecisions());
    }

    @GetMapping("/{id}")
    public ResponseEntity<DecisionResponse> getDecision(@PathVariable String id) {
        return ResponseEntity.ok(decisionService.getById(id));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_DELEGUE')")
    public ResponseEntity<?> deleteDecision(@PathVariable String id) {
        decisionService.deleteDecision(id);
        return ResponseEntity.ok().build();
    }
}
