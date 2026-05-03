package com.unigov.controller;

import com.unigov.dto.AuthDtos.*;
import com.unigov.entity.Role;
import com.unigov.entity.User;
import com.unigov.repository.UserRepository;
import com.unigov.security.JwtUtils;
import com.unigov.security.UserDetailsImpl;
import com.unigov.service.EmailService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;
import java.util.regex.Pattern;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private static final int MAX_FAILED_ATTEMPTS = 5;
    private static final long LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes
    private static final long RESET_TOKEN_EXPIRY_MS = 15 * 60 * 1000; // 15 minutes
    private static final Pattern PASSWORD_PATTERN =
            Pattern.compile("^(?=.*[A-Z])(?=.*[0-9]).{8,}$");

    @Autowired
    AuthenticationManager authenticationManager;

    @Autowired
    UserRepository userRepository;

    @Autowired
    PasswordEncoder encoder;

    @Autowired
    JwtUtils jwtUtils;

    @Autowired
    EmailService emailService;

    @org.springframework.beans.factory.annotation.Value("${enigov.app.allowedEmailDomain:@enicar.ucar.tn}")
    private String allowedEmailDomain;

    // ==================== LOGIN ====================

    @PostMapping("/signin")
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {
        // Check if user exists by email
        User user = userRepository.findByEmail(loginRequest.getEmail()).orElse(null);

        if (user == null) {
            return ResponseEntity.status(401)
                    .body(new MessageResponse("Échec de la connexion. Veuillez vérifier vos identifiants."));
        }

        // Check lockout
        if (user.getLockoutUntil() != null && user.getLockoutUntil().isAfter(LocalDateTime.now())) {
            long remainingMs = Duration.between(LocalDateTime.now(), user.getLockoutUntil()).toMillis();
            int remainingMin = (int) Math.ceil(remainingMs / 60000.0);
            return ResponseEntity.status(429)
                    .body(new MessageResponse("Compte verrouillé. Réessayez dans " + remainingMin + " minute(s)."));
        }

        // Authenticate password FIRST (before email check, so failed attempts always count)
        Authentication authentication;
        try {
            authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(loginRequest.getEmail(), loginRequest.getPassword()));
        } catch (Exception e) {
            // Failed password — increment attempts
            int attempts = user.getFailedLoginAttempts() + 1;
            user.setFailedLoginAttempts(attempts);

            if (attempts >= MAX_FAILED_ATTEMPTS) {
                user.setLockoutUntil(LocalDateTime.now().plus(Duration.ofMillis(LOCKOUT_DURATION_MS)));
                userRepository.save(user);
                return ResponseEntity.status(429)
                        .body(new MessageResponse("Trop de tentatives. Compte verrouillé pour 15 minutes."));
            }

            userRepository.save(user);
            int remaining = MAX_FAILED_ATTEMPTS - attempts;
            return ResponseEntity.status(401)
                    .body(new MessageResponse("Mot de passe incorrect. " + remaining + " tentative(s) restante(s)."));
        }

        // Password correct — now check email verification
        if (!user.isEmailVerified()) {
            return ResponseEntity.status(403)
                    .body(Map.of(
                            "message", "Votre email n'est pas encore vérifié. Vérifiez votre boîte de réception.",
                            "code", "EMAIL_NOT_VERIFIED",
                            "email", user.getEmail()
                    ));
        }

        // All good — reset failed attempts and issue JWT
        user.setFailedLoginAttempts(0);
        user.setLockoutUntil(null);
        userRepository.save(user);

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtUtils.generateJwtToken(authentication);

        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        String role = userDetails.getAuthorities().iterator().next().getAuthority();

        return ResponseEntity.ok(new JwtResponse(jwt,
                userDetails.getId(),
                userDetails.getUsername(),
                userDetails.getEmail(),
                role,
                userDetails.getFullName(),
                userDetails.getProfilePhoto()));
    }

    // ==================== SIGNUP ====================

    @PostMapping("/signup")
    public ResponseEntity<?> registerUser(@Valid @RequestBody SignupRequest signUpRequest) {
        // Validate email domain
        String email = signUpRequest.getEmail();
        if (email == null || (!allowedEmailDomain.isBlank() && !email.toLowerCase().endsWith(allowedEmailDomain))) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Erreur : Seuls les emails " + allowedEmailDomain + " sont acceptés."));
        }

        // Validate password strength
        if (!PASSWORD_PATTERN.matcher(signUpRequest.getPassword()).matches()) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Le mot de passe doit contenir au moins 8 caractères, une majuscule et un chiffre."));
        }

        if (userRepository.existsByEmail(signUpRequest.getEmail())) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Erreur : Cet email est déjà utilisé."));
        }

        // Auto-generate username from email prefix
        String username = signUpRequest.getEmail().split("@")[0].toLowerCase();
        // Ensure unique username
        String baseUsername = username;
        int counter = 1;
        while (userRepository.existsByUsername(username)) {
            username = baseUsername + counter;
            counter++;
        }

        // Create user with verification token
        String verificationToken = UUID.randomUUID().toString();

        User user = new User();
        user.setUsername(username);
        user.setEmail(signUpRequest.getEmail());
        user.setPassword(encoder.encode(signUpRequest.getPassword()));
        user.setFullName(signUpRequest.getFullName());
        user.setRole(Role.ROLE_ETUDIANT);
        user.setEmailVerified(false);
        user.setVerificationToken(verificationToken);

        userRepository.save(user);

        // Send verification email
        try {
            emailService.sendVerificationEmail(user.getEmail(), user.getFullName(), verificationToken);
        } catch (Exception e) {
            System.err.println("ERREUR ENVOI EMAIL : " + e.getMessage());
            e.printStackTrace();
        }

        return ResponseEntity.ok(new MessageResponse(
                "Inscription réussie ! Un email de vérification a été envoyé à " + user.getEmail()));
    }

    // ==================== EMAIL VERIFICATION ====================

    @GetMapping("/verify-email")
    public ResponseEntity<?> verifyEmail(@RequestParam String token) {
        User user = userRepository.findByVerificationToken(token).orElse(null);

        if (user == null) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Lien de vérification invalide ou expiré."));
        }

        user.setEmailVerified(true);
        user.setVerificationToken(null);
        userRepository.save(user);

        return ResponseEntity.ok(new MessageResponse("Email vérifié avec succès ! Vous pouvez maintenant vous connecter."));
    }

    @PostMapping("/resend-verification")
    public ResponseEntity<?> resendVerification(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        if (email == null || email.isBlank()) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Email requis."));
        }

        User user = userRepository.findByEmail(email).orElse(null);

        // Always return success (don't leak whether email exists)
        if (user == null || user.isEmailVerified()) {
            return ResponseEntity.ok(new MessageResponse("Si cet email existe, un nouveau lien a été envoyé."));
        }

        String newToken = UUID.randomUUID().toString();
        user.setVerificationToken(newToken);
        userRepository.save(user);

        try {
            emailService.sendVerificationEmail(user.getEmail(), user.getFullName(), newToken);
        } catch (Exception e) {
            // Silently fail — don't expose email infrastructure issues
        }

        return ResponseEntity.ok(new MessageResponse("Si cet email existe, un nouveau lien a été envoyé."));
    }

    // ==================== FORGOT PASSWORD ====================

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        if (email == null || email.isBlank()) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Email requis."));
        }

        User user = userRepository.findByEmail(email).orElse(null);

        // Always return success (prevent email enumeration)
        if (user == null) {
            return ResponseEntity.ok(new MessageResponse(
                    "Si un compte existe avec cet email, un lien de réinitialisation a été envoyé."));
        }

        String resetToken = UUID.randomUUID().toString();
        user.setResetToken(resetToken);
        user.setResetTokenExpiry(LocalDateTime.now().plus(Duration.ofMillis(RESET_TOKEN_EXPIRY_MS)));
        userRepository.save(user);

        try {
            emailService.sendPasswordResetEmail(user.getEmail(), user.getFullName(), resetToken);
        } catch (Exception e) {
            // Silently fail
        }

        return ResponseEntity.ok(new MessageResponse(
                "Si un compte existe avec cet email, un lien de réinitialisation a été envoyé."));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody Map<String, String> body) {
        String token = body.get("token");
        String newPassword = body.get("password");

        if (token == null || newPassword == null) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Token et nouveau mot de passe requis."));
        }

        if (!PASSWORD_PATTERN.matcher(newPassword).matches()) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Le mot de passe doit contenir au moins 8 caractères, une majuscule et un chiffre."));
        }

        User user = userRepository.findByResetToken(token).orElse(null);

        if (user == null) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Lien de réinitialisation invalide."));
        }

        if (user.getResetTokenExpiry() == null || user.getResetTokenExpiry().isBefore(LocalDateTime.now())) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Le lien de réinitialisation a expiré. Veuillez en demander un nouveau."));
        }

        user.setPassword(encoder.encode(newPassword));
        user.setResetToken(null);
        user.setResetTokenExpiry(null);
        user.setFailedLoginAttempts(0);
        user.setLockoutUntil(null);
        userRepository.save(user);

        return ResponseEntity.ok(new MessageResponse("Mot de passe réinitialisé avec succès !"));
    }
}
