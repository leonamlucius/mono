package com.mono.monoapi.service;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import org.springframework.ai.chat.messages.Message;
import org.springframework.beans.factory.annotation.Autowired;

import com.mono.monoapi.dto.ChatResponseDTO;
import com.mono.monoapi.dto.ChatGroupData;
import com.mono.monoapi.dto.GroupedHistoryReponseDTO;

import org.springframework.ai.chat.memory.ChatMemory;
import org.springframework.stereotype.Service;

import com.mono.monoapi.repository.ChatMessageRepository;

@Service
public class HistoryService {

    @Autowired
    private ChatMessageRepository chatMessageRepository;

    private final ChatMemory chatMemory;

    public HistoryService(ChatMemory chatMemory) {
        this.chatMemory = chatMemory;
    }

    public GroupedHistoryReponseDTO getHistorico(String conversationId) {

        List<Message> response = this.chatMemory.get(conversationId, Integer.MAX_VALUE);

        DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("dd/MM/yyyy");

        Map<String, List<ChatResponseDTO>> agrupadoPorData = response.stream()
                .collect(Collectors.groupingBy(
                        msg -> extractDateFromMetadata(msg, dateFormatter),
                        LinkedHashMap::new,
                        Collectors.mapping(this::mapToDTO, Collectors.toList())));

        List<ChatGroupData> contentAgrupado = agrupadoPorData.entrySet().stream()
                .map(entry -> new ChatGroupData(entry.getKey(), entry.getValue()))
                .toList();

        int totalElements = response.size();

        return new GroupedHistoryReponseDTO(
                contentAgrupado,
                0, // page
                totalElements, // size (tamanho real de mensagens)
                totalElements, // totalElements
                1, // totalPages (1 página com tudo)
                true // isLast
        );
    }

    private String extractDateFromMetadata(Message msg, DateTimeFormatter formatter) {
        Object timestampObj = msg.getMetadata().get("timestamp");

        if (timestampObj instanceof Long epochMilli) {
            return Instant.ofEpochMilli(epochMilli)
                    .atZone(ZoneId.systemDefault())
                    .format(formatter);
        } else if (timestampObj instanceof String dateStr) {
            return dateStr;
        }

        return LocalDate.now().format(formatter);
    }

    private ChatResponseDTO mapToDTO(Message msg) {
        String messageType = msg.getMessageType().name();
        String modelName;

        if ("USER".equalsIgnoreCase(messageType)) {
            modelName = "USER";
        } else {
            Object metaModel = msg.getMetadata().get("model");
            modelName = (metaModel != null && !metaModel.toString().isBlank())
                    ? metaModel.toString()
                    : "ASSISTANT";
        }

        return new ChatResponseDTO(
                msg.getText(),
                modelName,
                "SUCCESS",
                msg.getMetadata().get("hour").toString()
            );
    }

}
