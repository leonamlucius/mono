package com.mono.monoapi.repository;

import com.mono.monoapi.model.ChatMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {

    List<ChatMessage> findByConversationIdOrderByCreatedAtAsc(String conversationId);

    void deleteByConversationId(String conversationId);

    @Transactional
    @Modifying
    void deleteByCreatedAtBefore(LocalDateTime cutoffDate);
}