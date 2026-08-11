package com.mono.monoapi.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.ColumnTransformer;
import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "chat_messages")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatMessage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "conversation_id", nullable = false)
    private String conversationId;

    @Column(name = "message_type", nullable = false)
    private String messageType;

    @ColumnTransformer(
        read = "pgp_sym_decrypt(content, current_setting('app.encrypt_key'))",
        write = "pgp_sym_encrypt(?, current_setting('app.encrypt_key'))"
    )
    @Column(columnDefinition = "bytea")
    private String content;

    @Column(name = "model_name")
    private String modelName;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

}
