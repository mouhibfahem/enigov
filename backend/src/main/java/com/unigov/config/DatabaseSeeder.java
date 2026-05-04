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
        // Supprimer les anciens événements pour repartir sur une base propre avec les périodes
        eventRepository.deleteAll();
        seedEvents();
    }

    private void seedEvents() {
        List<Event> events = Arrays.asList(
            // Septembre
            createEvent("Journées d'intégration", "Accueil des nouveaux étudiants.", 
                LocalDateTime.of(2025, 9, 2, 9, 0), LocalDateTime.of(2025, 9, 5, 18, 0), "ENICarthage", "SOCIAL"),
            
            // Novembre
            createEvent("DS & Examens P1 (INFO3)", "Période d'évaluation intermédiaire.", 
                LocalDateTime.of(2025, 11, 3, 8, 30), LocalDateTime.of(2025, 11, 8, 17, 0), "Salles d'examen", "EXAM"),
            createEvent("Forum des Entreprises ENICarthage", "Événement majeur de recrutement.", 
                LocalDateTime.of(2025, 11, 20, 9, 0), LocalDateTime.of(2025, 11, 20, 18, 0), "Hall et Amphi", "SOCIAL"),
            
            // Décembre
            createEvent("Examens TP S1 & Soutenances Projets", "Évaluations pratiques du semestre 1.", 
                LocalDateTime.of(2025, 12, 8, 8, 30), LocalDateTime.of(2025, 12, 20, 17, 0), "Laboratoires", "EXAM"),
            
            // Janvier
            createEvent("Examens Session Principale S1", "Épreuves finales du premier semestre.", 
                LocalDateTime.of(2026, 1, 5, 8, 30), LocalDateTime.of(2026, 1, 14, 17, 0), "Salles d'examen", "EXAM"),
            createEvent("Démarrage du Semestre 2", "Reprise des cours pour tous.", 
                LocalDateTime.of(2026, 1, 15, 8, 30), null, "ENICarthage", "ACADEMIC"),
            
            // Mars
            createEvent("DS Semestre 2 (Aïd)", "Évaluations du second semestre.", 
                LocalDateTime.of(2026, 3, 9, 8, 30), LocalDateTime.of(2026, 3, 14, 17, 0), "Salles d'examen", "EXAM"),
            
            // Avril
            createEvent("Visites entreprises", "Découverte du monde industriel.", 
                LocalDateTime.of(2026, 4, 6, 9, 0), LocalDateTime.of(2026, 4, 8, 17, 0), "Divers sites", "SOCIAL"),
            createEvent("Examens TP S2 & Soutenances Projets", "Évaluations pratiques S2.", 
                LocalDateTime.of(2026, 4, 27, 8, 30), LocalDateTime.of(2026, 5, 9, 17, 0), "Laboratoires", "EXAM"),
            
            // Mai
            createEvent("Examens Session Principale S2", "Épreuves finales du second semestre.", 
                LocalDateTime.of(2026, 5, 18, 8, 30), LocalDateTime.of(2026, 5, 25, 17, 0), "Salles d'examen", "EXAM"),
            
            // Juillet
            createEvent("Soutenances PFE", "Période de soutenances des ingénieurs diplômants.", 
                LocalDateTime.of(2026, 7, 1, 8, 30), LocalDateTime.of(2026, 7, 4, 18, 0), "Salles de soutenance", "ACADEMIC")
        );

        eventRepository.saveAll(events);
        System.out.println(">>> SEEDER : Calendrier mis à jour avec les périodes (Début/Fin).");
    }

    private Event createEvent(String title, String desc, LocalDateTime start, LocalDateTime end, String loc, String type) {
        Event e = new Event();
        e.setTitle(title);
        e.setDescription(desc);
        e.setDate(start);
        e.setEndDate(end);
        e.setLocation(loc);
        e.setType(type);
        return e;
    }
}
