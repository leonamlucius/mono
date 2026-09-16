package com.mono.monoapi.config;

import com.mono.monoapi.model.ChatMessage;
import com.mono.monoapi.repository.ChatMessageRepository;
import org.springframework.ai.chat.memory.ChatMemory;
import org.springframework.ai.chat.messages.AssistantMessage;
import org.springframework.ai.chat.messages.Message;
import org.springframework.ai.chat.messages.UserMessage;
import java.time.format.DateTimeFormatter;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;

@Component
public class PgSqlChatMemory implements ChatMemory {

    private final ChatMessageRepository repository;

    public PgSqlChatMemory(ChatMessageRepository repository) {
        this.repository = repository;
    }

    @Override
    public void add(String conversationId, List<Message> messages) {
        for (Message msg : messages) {
            String modelName = "USER";
            if (!"USER".equalsIgnoreCase(msg.getMessageType().name())) {
                Object metaModel = msg.getMetadata().get("model");
                modelName = (metaModel != null) ? metaModel.toString() : "ASSISTANT";
            }

            ChatMessage entity = new ChatMessage();
            entity.setConversationId(conversationId);
            entity.setMessageType(msg.getMessageType().name());
            entity.setContent(msg.getText());
            entity.setModelName(modelName);
            repository.save(entity);
        }
    }

    @Override
    public List<Message> get(String conversationId, int lastN) {
        List<ChatMessage> entities = repository.findByConversationIdOrderByCreatedAtAsc(conversationId);

        int start = Math.max(0, entities.size() - lastN);
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy");

        return entities.subList(start, entities.size())
                .stream()
                .<Message>map(e -> {
                    Map<String, Object> metadata = Map.of(
                            "hour", e.getCreatedAt().format(DateTimeFormatter.ofPattern("HH:mm")),
                            "timestamp", e.getCreatedAt().format(formatter),
                            "model", e.getModelName() != null
                                    ? e.getModelName()
                                    : "ASSISTANT");

                    if ("USER".equalsIgnoreCase(e.getMessageType())) {
                        return new UserMessage(
                                e.getContent(),
                                List.of(),
                                metadata);
                    }

                    return new AssistantMessage(
                            e.getContent(),
                            metadata);
                })
                .toList();
    }

    @Override
    public void clear(String conversationId) {
        repository.deleteByConversationId(conversationId);
    }
}