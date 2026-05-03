package com.unigov.controller;

import com.unigov.entity.User;
import com.unigov.repository.UserRepository;
import com.unigov.security.UserDetailsImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.HashMap;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
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

    @Value("${file.upload-dir}")
    private String uploadDir;

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
            Path rootLocation = Paths.get(uploadDir).toAbsolutePath().normalize();
            Files.createDirectories(rootLocation);

            // Delete old photo if exists
            if (user.getProfilePhoto() != null) {
                Path oldPhoto = rootLocation.resolve(user.getProfilePhoto());
                Files.deleteIfExists(oldPhoto);
            }

            String originalName = StringUtils.cleanPath(file.getOriginalFilename());
            String extension = originalName.contains(".")
                    ? originalName.substring(originalName.lastIndexOf("."))
                    : ".jpg";
            String uniqueFileName = UUID.randomUUID().toString() + extension;
            Path targetLocation = rootLocation.resolve(uniqueFileName);

            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);

            user.setProfilePhoto(uniqueFileName);
            userRepository.save(user);

            return ResponseEntity.ok(Map.of(
                    "message", "Photo de profil mise à jour.",
                    "profilePhoto", uniqueFileName
            ));

        } catch (IOException e) {
            return ResponseEntity.internalServerError()
                    .body(Map.of("message", "Erreur lors de l'upload du fichier."));
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

        // Verify current password
        if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
            return ResponseEntity.status(401)
                    .body(Map.of("message", "Le mot de passe actuel est incorrect."));
        }

        // Validate new password strength
        if (!PASSWORD_PATTERN.matcher(newPassword).matches()) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Le nouveau mot de passe doit contenir au moins 8 caractères, une majuscule et un chiffre."));
        }

        // Don't allow same password
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
