package com.mono.monoapi.service;

import java.util.List;
import org.springframework.ai.chat.messages.Message;

import com.mono.monoapi.dto.ChatResponseDTO;

import org.springframework.ai.chat.memory.ChatMemory;
import org.springframework.stereotype.Service;

@Service
public class HistoryService {

    private final ChatMemory chatMemory;

    public HistoryService(ChatMemory chatMemory) {
        this.chatMemory = chatMemory;
    }

    public List<ChatResponseDTO> getHistorico(String conversationId) {

        List<Message> response = this.chatMemory.get(conversationId, 100);
        List<ChatResponseDTO> responseList = response.stream()
                .map(msg -> {
                    String messageType = msg.getMessageType().name(); // USER ou ASSISTANT
                    String modelName;

                    if ("USER".equalsIgnoreCase(messageType)) {
                        modelName = "USER";
                    } else {
                        // Tenta buscar o nome do modelo salvo pelo Spring AI no mapa de metadados
                        Object metaModel = msg.getMetadata().get("model");

                        if (metaModel != null && !metaModel.toString().isBlank()) {
                            modelName = metaModel.toString(); // Ex: "llama-3.3-70b" ou "qwen2.5:0.5b"
                        } else {
                            modelName = "ASSISTANT"; // Fallback genérico caso não haja metadado
                        }
                    }

                    return new ChatResponseDTO(
                            msg.getText(),
                            modelName,
                            "SUCCESS");
                })
                .toList();

        return responseList;

    }
}
