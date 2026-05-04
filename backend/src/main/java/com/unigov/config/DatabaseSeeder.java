package com.unigov.config;

import com.unigov.entity.Event;
import com.unigov.repository.EventRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

@Component
public class DatabaseSeeder implements CommandLineRunner {

    @Autowired
    private EventRepository eventRepository;

    @Override
    public void run(String... args) throws Exception {
        if (!eventRepository.existsByTitle("Forum des Entreprises ENICarthage")) {
            seedEvents();
        }
    }

    private void seedEvents() {
        List<Event> events = Arrays.asList(
            // Septembre
            createEvent("Journées d'intégration", "Accueil des nouveaux étudiants.", LocalDateTime.of(2025, 9, 2, 9, 0), "ENICarthage", "SOCIAL"),
            createEvent("Session posters stage 1ère année", "Présentation des stages d'été.", LocalDateTime.of(2025, 9, 24, 9, 0), "Hall", "ACADEMIC"),
            
            // Octobre
            createEvent("Soutenances stages 2ème année", "Présentation des stages techniques.", LocalDateTime.of(2025, 10, 1, 9, 0), "Salles de soutenance", "ACADEMIC"),
            createEvent("Remise des diplômes 2025", "Cérémonie officielle de remise des diplômes.", LocalDateTime.of(2025, 10, 25, 16, 0), "Amphi Principal", "SOCIAL"),
            
            // Novembre
            createEvent("Fin 1ère période INFO3", "Clôture des enseignements du premier bloc.", LocalDateTime.of(2025, 11, 2, 17, 0), "ENICarthage", "ADMIN"),
            createEvent("DS & Examens P1 (INFO3)", "Période d'évaluation intermédiaire.", LocalDateTime.of(2025, 11, 3, 8, 30), "Salles d'examen", "EXAM"),
            createEvent("Forum des Entreprises ENICarthage", "Événement majeur de recrutement.", LocalDateTime.of(2025, 11, 20, 9, 0), "Hall et Amphi", "SOCIAL"),
            
            // Décembre
            createEvent("Examens TP S1 & Soutenances Projets", "Évaluations pratiques du semestre 1.", LocalDateTime.of(2025, 12, 8, 8, 30), "Laboratoires", "EXAM"),
            createEvent("Affichage notes CC S1", "Publication des notes de contrôle continu.", LocalDateTime.of(2025, 12, 25, 10, 0), "Tableau d'affichage", "ADMIN"),
            
            // Janvier
            createEvent("Examens Session Principale S1", "Épreuves finales du premier semestre.", LocalDateTime.of(2026, 1, 5, 8, 30), "Salles d'examen", "EXAM"),
            createEvent("Démarrage du Semestre 2", "Reprise des cours pour tous.", LocalDateTime.of(2026, 1, 15, 8, 30), "ENICarthage", "ACADEMIC"),
            createEvent("Notes SP Classes Terminales", "Affichage des résultats finaux.", LocalDateTime.of(2026, 1, 23, 14, 0), "Plateforme", "ADMIN"),
            
            // Février
            createEvent("Notes SR Classes Terminales", "Résultats de la session de rattrapage.", LocalDateTime.of(2026, 2, 13, 14, 0), "Plateforme", "ADMIN"),
            createEvent("Notes SP Semestre 1", "Affichage général des résultats S1.", LocalDateTime.of(2026, 2, 25, 14, 0), "Plateforme", "ADMIN"),
            
            // Mars
            createEvent("DS Semestre 2 (Aïd)", "Évaluations du second semestre.", LocalDateTime.of(2026, 3, 9, 8, 30), "Salles d'examen", "EXAM"),
            
            // Avril
            createEvent("Visites entreprises", "Découverte du monde industriel.", LocalDateTime.of(2026, 4, 6, 9, 0), "Divers sites", "SOCIAL"),
            createEvent("Examens TP S2 & Soutenances Projets", "Évaluations pratiques S2.", LocalDateTime.of(2026, 4, 27, 8, 30), "Laboratoires", "EXAM"),
            
            // Mai
            createEvent("Soutenances PFA GI", "Projets de fin d'année - Génie Info.", LocalDateTime.of(2026, 5, 6, 9, 0), "Salles de soutenance", "ACADEMIC"),
            createEvent("Arrêt des cours S2", "Fin des enseignements théoriques.", LocalDateTime.of(2026, 5, 9, 12, 0), "ENICarthage", "ADMIN"),
            createEvent("Notes CC S2", "Affichage des notes de contrôle continu S2.", LocalDateTime.of(2026, 5, 14, 10, 0), "Tableau d'affichage", "ADMIN"),
            createEvent("Examens Session Principale S2", "Épreuves finales du second semestre.", LocalDateTime.of(2026, 5, 18, 8, 30), "Salles d'examen", "EXAM"),
            
            // Juin
            createEvent("Soutenances PFA GE", "Projets de fin d'année - Génie Élec.", LocalDateTime.of(2026, 6, 1, 9, 0), "Salles de soutenance", "ACADEMIC"),
            createEvent("Notes SP Semestre 2", "Publication des résultats finaux.", LocalDateTime.of(2026, 6, 4, 14, 0), "Plateforme", "ADMIN"),
            createEvent("Dépôt rapport PFE", "Date limite pour les rapports de fin d'études.", LocalDateTime.of(2026, 6, 20, 16, 0), "Administration", "ACADEMIC"),
            
            // Juillet
            createEvent("Notes SR S2", "Résultats des rattrapages.", LocalDateTime.of(2026, 7, 2, 14, 0), "Plateforme", "ADMIN"),
            createEvent("Soutenances PFE", "Période de soutenances des ingénieurs diplômants.", LocalDateTime.of(2026, 7, 1, 8, 30), "Salles de soutenance", "ACADEMIC")
        );

        eventRepository.saveAll(events);
        System.out.println(">>> SEEDER : " + events.size() + " événements ENICarthage ont été créés avec succès.");
        
        // Petit test pour aujourd'hui
        Event test = createEvent("Test Système UniGov", "Si vous voyez ceci, le calendrier fonctionne !", 
            LocalDateTime.now().plusHours(1), "Serveur Local", "ACADEMIC");
        eventRepository.save(test);
    }

    private Event createEvent(String title, String desc, LocalDateTime date, String loc, String type) {
        Event e = new Event();
        e.setTitle(title);
        e.setDescription(desc);
        e.setDate(date);
        e.setLocation(loc);
        e.setType(type);
        return e;
    }
}
