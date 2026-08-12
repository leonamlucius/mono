package com.mono.monoapi.service;

import org.springframework.stereotype.Service;
import java.util.Optional;
import java.util.List;

import com.mono.monoapi.config.JwtUtil;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.memory.ChatMemory;
import org.springframework.beans.factory.annotation.Autowired;
import com.mono.monoapi.service.GroqAiService;
import com.mono.monoapi.repository.SummarizeRepository;
import com.mono.monoapi.model.User;
import com.mono.monoapi.model.Summarize;
import java.time.LocalDateTime;

import org.springframework.ai.chat.messages.Message;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
public class SummarizeService {

    private static final Logger logger = LoggerFactory.getLogger(SummarizeService.class);

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private SummarizeRepository summarizeRepository;

    @Autowired
    private ChatClient chatClient;

    @Autowired
    private ChatMemory chatMemory;

    @Autowired
    private GroqAiService groqAiService;

    public String summarizeText(String bearerToken) {

        if (bearerToken == null) {
            logger.error("Token de autorização não fornecido");
            throw new IllegalArgumentException("Token de autorização inválido");
        }

        String token = bearerToken;

        String userIdStr = jwtUtil.extractUserIdFromToken(token);
        Long userId = Long.parseLong(userIdStr);

        Optional<Summarize> existingSummarize = summarizeRepository.findByUserId(userId);

        LocalDateTime now = LocalDateTime.now();

        if (existingSummarize.isPresent()) {
            Summarize record = existingSummarize.get();

            boolean isWithinTwoHours = record.getUpdatedAt().plusHours(2).isAfter(now);

            if (isWithinTwoHours) {
                logger.info("Resumo existente encontrado para o usuário {}. Retornando resumo existente.", userId);
                return record.getText();
            }
        }

        String newSummaryText = generateNewSummaryText(userIdStr);

        User userRef = new User();

        userRef.setId(userId);

        Summarize summarizeToSave = existingSummarize.orElse(
                Summarize.builder()
                        .user(userRef)
                        .build());

        summarizeToSave.setText(newSummaryText);
        summarizeToSave.setUpdatedAt(now);

        summarizeRepository.save(summarizeToSave);

        logger.info("Novo resumo gerado e salvo para o usuário {}.", userId);

        return newSummaryText;
    }

    private String generateNewSummaryText(String userId) {

        String prompt = "Escreva um título nominal (sem verbos conjugados) de no máximo 7 palavras representando o tema principal desta conversa.\r\n"
                + 
                " Responda em português brasileiro, sem aspas, sem formatação e apenas em texto corrido.\r\n"
                + 
                "Se não houver informações suficientes para gerar um título, responda com informações da pergunta.\r\n"
                + 
                "Evite usar a palavra \"nominal\" no título.\r\n"
                +"Evite usar as instruções do prompt no título.";

        String response = this.groqAiService.getSummary(prompt, userId);
        return response;

    }
}
