package com.unigov;

import com.unigov.entity.Role;
import com.unigov.entity.User;
import com.unigov.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(DataInitializer.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        seedDelegueAccount();
    }

    private void seedDelegueAccount() {
        String delegueEmail = "delegue@enicar.ucar.tn";

        if (userRepository.findByEmail(delegueEmail).isEmpty()) {
            User delegue = new User();
            delegue.setUsername("delegue");
            delegue.setEmail(delegueEmail);
            delegue.setPassword(passwordEncoder.encode("Delegue2026"));
            delegue.setFullName("Délégué ENICarthage");
            delegue.setRole(Role.ROLE_DELEGUE);
            delegue.setEmailVerified(true);
            userRepository.save(delegue);
            logger.info("Compte délégué créé : {}", delegueEmail);
        } else {
            logger.info("Compte délégué existe déjà.");
        }
    }
}
