package com.unigov.repository;

import com.unigov.entity.Filiere;
import com.unigov.entity.Promotion;
import com.unigov.entity.Role;
import com.unigov.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, String> {
    Optional<User> findByUsername(String username);

    Optional<User> findByEmail(String email);

    Optional<User> findByVerificationToken(String verificationToken);

    Optional<User> findByResetToken(String resetToken);

    Boolean existsByUsername(String username);

    Boolean existsByEmail(String email);

    List<User> findByRole(Role role);

    List<User> findByRoleAndFiliereIn(Role role, Collection<Filiere> filieres);

    List<User> findByRoleAndPromotionIn(Role role, Collection<Promotion> promotions);

    List<User> findByRoleAndFiliereInAndPromotionIn(Role role, Collection<Filiere> filieres, Collection<Promotion> promotions);

    long countByFiliere(Filiere filiere);

    long countByPromotion(Promotion promotion);

    long countByFiliereAndPromotion(Filiere filiere, Promotion promotion);
}
