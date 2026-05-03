package com.unigov;

import com.unigov.service.AnnouncementService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import static org.junit.jupiter.api.Assertions.assertNotNull;

@SpringBootTest
class UniGovApplicationTests {

    @Autowired
    private AnnouncementService announcementService;

    @Test
    void contextLoads() {
        assertNotNull(announcementService, "Le contexte Spring devrait charger le service d'annonces.");
    }
}
