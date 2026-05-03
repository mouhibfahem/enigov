package com.unigov.repository;

import com.unigov.entity.Complaint;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ComplaintRepository extends JpaRepository<Complaint, String> {
    List<Complaint> findByStudentIdOrderByCreatedAtDesc(String studentId);
    List<Complaint> findByIsPublicTrueOrderByCreatedAtDesc();
    List<Complaint> findAllByOrderByCreatedAtDesc();
}
