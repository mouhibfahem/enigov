package com.unigov.service;

import com.unigov.dto.EventDtos.*;
import com.unigov.entity.Event;
import com.unigov.entity.Notification.NotificationType;
import com.unigov.repository.EventRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class EventService {

    @Autowired
    private EventRepository eventRepository;

    @Autowired
    private NotificationService notificationService;

    public EventResponse createEvent(EventRequest request) {
        Event event = new Event();
        event.setTitle(request.getTitle());
        event.setDescription(request.getDescription());
        event.setDate(request.getDate());
        event.setEndDate(request.getEndDate());
        event.setLocation(request.getLocation());
        if (request.getType() != null) {
            event.setType(request.getType());
        }

        Event saved = eventRepository.save(event);

        notificationService.notifyAllStudents(
                NotificationType.NEW_EVENT,
                "Nouvel événement : " + saved.getTitle(),
                saved.getId()
        );

        return mapToResponse(saved);
    }

    public List<EventResponse> getAllEvents() {
        return eventRepository.findAllByOrderByDateAsc().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<EventResponse> getUpcomingEvents() {
        return eventRepository.findByDateAfterOrderByDateAsc(LocalDateTime.now()).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public EventResponse getById(String id) {
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Événement non trouvé"));
        return mapToResponse(event);
    }

    public void deleteEvent(String id) {
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Événement non trouvé"));
        eventRepository.delete(event);
    }

    private EventResponse mapToResponse(Event e) {
        EventResponse r = new EventResponse();
        r.setId(e.getId());
        r.setTitle(e.getTitle());
        r.setDescription(e.getDescription());
        r.setDate(e.getDate());
        r.setEndDate(e.getEndDate());
        r.setLocation(e.getLocation());
        r.setType(e.getType());
        r.setCreatedAt(e.getCreatedAt());
        return r;
    }
}
