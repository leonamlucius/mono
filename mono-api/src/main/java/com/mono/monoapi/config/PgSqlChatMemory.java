package com.mono.monoapi.config;

import com.mono.monoapi.model.ChatMessage;
import com.mono.monoapi.repository.ChatMessageRepository;
import org.springframework.ai.chat.memory.ChatMemory;
import org.springframework.ai.chat.messages.AssistantMessage;
import org.springframework.ai.chat.messages.Message;
import org.springframework.ai.chat.messages.UserMessage;
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
        List<ChatMessage> recentEntities = entities.subList(start, entities.size());

        return recentEntities.stream()
                .map(e -> {
                    if ("USER".equalsIgnoreCase(e.getMessageType())) {
                        return (Message) new UserMessage(e.getContent());
                    } else {
                        String model = e.getModelName() != null ? e.getModelName() : "ASSISTANT";
                        return (Message) new AssistantMessage(e.getContent(), Map.of("model", model));
                    }
                })
                .toList();
    }

    @Override
    public void clear(String conversationId) {
        repository.deleteByConversationId(conversationId);
    }
}