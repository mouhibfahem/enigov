package com.unigov.repository;

import com.unigov.entity.Event;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface EventRepository extends JpaRepository<Event, String> {
    List<Event> findAllByOrderByDateAsc();
    List<Event> findByDateAfterOrderByDateAsc(LocalDateTime date);
    boolean existsByTitle(String title);
}
