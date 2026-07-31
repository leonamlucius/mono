package com.mono.monoapi.service;

import org.springframework.stereotype.Service;
import java.util.Optional;

import com.mono.monoapi.config.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import com.mono.monoapi.repository.SummarizeRepository;
import com.mono.monoapi.model.Login;
import com.mono.monoapi.model.Summarize;
import java.time.LocalDateTime;

@Service
public class SummarizeService {

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private SummarizeRepository summarizeRepository;

    @Autowired
    private GroqAiService groqAiService;

    public String summarizeText(String bearerToken) {

        if (bearerToken == null || !bearerToken.startsWith("Bearer ")) {
            throw new IllegalArgumentException("Token de autorização inválido");
        }

        String token = bearerToken.replace("Bearer ", "");

        String userIdStr = jwtUtil.extractUserIdFromToken(token);
        Long userId = Long.parseLong(userIdStr);

        Optional<Summarize> existingSummarize = summarizeRepository.findByUserId(userId);

        LocalDateTime now = LocalDateTime.now();

        if (existingSummarize.isPresent()) {
            Summarize record = existingSummarize.get();

            boolean isWithinTwoHours = record.getUpdatedAt().plusHours(2).isAfter(now);

            if (isWithinTwoHours) {
                return record.getText();
            }
        }

        String newSummaryText = generateNewSummaryText(userIdStr);

        Login userRef = new Login();

        userRef.setId(userId);

        Summarize summarizeToSave = existingSummarize.orElse(
                Summarize.builder()
                        .user(userRef)
                        .build());

        summarizeToSave.setText(newSummaryText);
        summarizeToSave.setUpdatedAt(now);

        summarizeRepository.save(summarizeToSave);

        return newSummaryText;
    }

    private String generateNewSummaryText(String userId) {

        String responseString = groqAiService.chat(
                """
                        Escreva um título nominal (sem verbos conjugados) de no máximo 7 palavras representando o tema principal desta conversa.
                                               Responda em português brasileiro, sem aspas, sem formatação e apenas em texto corrido.
                                               Se não houver informações suficientes para gerar um título, responda com informações da pergunta.
                                               Evite usar a palavra "nominal" no título.
                                                           """,
                userId);

        return responseString;
    }

}
