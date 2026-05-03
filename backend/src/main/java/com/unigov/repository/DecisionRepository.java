package com.unigov.repository;

import com.unigov.entity.Decision;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DecisionRepository extends JpaRepository<Decision, String> {
    List<Decision> findAllByOrderByCreatedAtDesc();
}
