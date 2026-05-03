package com.unigov.repository;

import com.unigov.entity.Regulation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RegulationRepository extends JpaRepository<Regulation, String> {
    List<Regulation> findAllByOrderByCreatedAtDesc();
}
