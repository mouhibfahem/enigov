package com.unigov.repository;

import com.unigov.entity.Message;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MessageRepository extends JpaRepository<Message, String> {

    @Query("SELECT m FROM Message m WHERE " +
           "(m.senderId = ?1 AND m.recipientId = ?2) OR " +
           "(m.senderId = ?2 AND m.recipientId = ?1) " +
           "ORDER BY m.timestamp ASC")
    List<Message> findConversation(String userId1, String userId2);

    List<Message> findBySenderIdOrRecipientIdOrderByTimestampDesc(String senderId, String recipientId);

    long countByRecipientIdAndSenderIdAndIsReadFalse(String recipientId, String senderId);

    long countByRecipientIdAndIsReadFalse(String recipientId);

    List<Message> findByRecipientIdAndSenderIdAndIsReadFalse(String recipientId, String senderId);
}
