package com.unigov.controller;

import com.unigov.entity.User;
import com.unigov.repository.UserRepository;
import com.unigov.security.UserDetailsImpl;
import com.unigov.service.FileStorageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.HashMap;
import java.util.Map;
import java.util.Set;
import java.util.regex.Pattern;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private static final long MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
    private static final Set<String> ALLOWED_TYPES = Set.of("image/jpeg", "image/png", "image/webp");
    private static final Pattern PASSWORD_PATTERN =
            Pattern.compile("^(?=.*[A-Z])(?=.*[0-9]).{8,}$");

    @Autowired
    UserRepository userRepository;

    @Autowired
    PasswordEncoder passwordEncoder;

    @Autowired
    FileStorageService fileStorageService;

    // ==================== GET CURRENT USER ====================

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser() {
        User user = getAuthenticatedUser();

        Map<String, Object> response = new HashMap<>();
        response.put("id", user.getId());
        response.put("username", user.getUsername());
        response.put("email", user.getEmail());
        response.put("fullName", user.getFullName());
        response.put("role", user.getRole());
        response.put("profilePhoto", user.getProfilePhoto());
        response.put("filiere", user.getFiliere() != null ? user.getFiliere().name() : null);
        response.put("promotion", user.getPromotion() != null ? user.getPromotion().name() : null);

        return ResponseEntity.ok(response);
    }

    // ==================== UPDATE PROFILE (name only) ====================

    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(@RequestBody Map<String, String> updates) {
        User user = getAuthenticatedUser();

        if (updates.containsKey("fullName")) {
            String fullName = updates.get("fullName");
            if (fullName != null && !fullName.isBlank()) {
                user.setFullName(fullName.trim());
            }
        }

        userRepository.save(user);
        return ResponseEntity.ok(Map.of("message", "Profil mis à jour avec succès."));
    }

    // ==================== UPLOAD PROFILE PHOTO ====================

    @PostMapping("/photo")
    public ResponseEntity<?> uploadProfilePhoto(@RequestParam("file") MultipartFile file) {
        User user = getAuthenticatedUser();

        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Veuillez sélectionner un fichier."));
        }

        // Validate file type
        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_TYPES.contains(contentType)) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Format non supporté. Utilisez JPG, PNG ou WebP."));
        }

        // Validate file size
        if (file.getSize() > MAX_FILE_SIZE) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Le fichier est trop volumineux. Maximum 5 Mo."));
        }

        try {
            // Upload to Cloudinary via FileStorageService
            String photoUrl = fileStorageService.storeFile(file);

            // Enregistrer l'URL Cloudinary dans le profil utilisateur
            user.setProfilePhoto(photoUrl);
            userRepository.save(user);

            return ResponseEntity.ok(Map.of(
                    "message", "Photo de profil mise à jour.",
                    "profilePhoto", photoUrl
            ));

        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(Map.of("message", "Erreur lors de l'upload vers Cloudinary."));
        }
    }

    // ==================== CHANGE PASSWORD ====================

    @PutMapping("/password")
    public ResponseEntity<?> changePassword(@RequestBody Map<String, String> body) {
        String currentPassword = body.get("currentPassword");
        String newPassword = body.get("newPassword");

        if (currentPassword == null || newPassword == null) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Mot de passe actuel et nouveau mot de passe requis."));
        }

        User user = getAuthenticatedUser();

        if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
            return ResponseEntity.status(401)
                    .body(Map.of("message", "Le mot de passe actuel est incorrect."));
        }

        if (!PASSWORD_PATTERN.matcher(newPassword).matches()) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Le nouveau mot de passe doit contenir au moins 8 caractères, une majuscule et un chiffre."));
        }

        if (passwordEncoder.matches(newPassword, user.getPassword())) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Le nouveau mot de passe doit être différent de l'ancien."));
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        return ResponseEntity.ok(Map.of("message", "Mot de passe modifié avec succès."));
    }

    // ==================== HELPER ====================

    private User getAuthenticatedUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        return userRepository.findById(userDetails.getId())
                .orElseThrow(() -> new RuntimeException("Utilisateur introuvable."));
    }
}
