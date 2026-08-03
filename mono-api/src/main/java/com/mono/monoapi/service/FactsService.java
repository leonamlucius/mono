package com.mono.monoapi.service;

import org.springframework.stereotype.Service;
import java.util.ArrayList;
import com.mono.monoapi.repository.FactsRepository;
import com.mono.monoapi.model.Facts;
import com.mono.monoapi.dto.FactsResponse;
import com.mono.monoapi.service.GroqAiService;
import org.springframework.beans.factory.annotation.Autowired;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
public class FactsService {

    private static final Logger logger = LoggerFactory.getLogger(FactsService.class);

    @Autowired
    private GroqAiService groqAiService;

    @Autowired
    private FactsRepository factsRepository;

    public List<FactsResponse> getFact() {

        LocalDate date = LocalDate.now();

        LocalDateTime startOfDay = date.atStartOfDay();
        LocalDateTime endOfDay = date.atTime(LocalTime.MAX);

        List<Facts> todayFacts = factsRepository.findByCreatedAtBetween(startOfDay, endOfDay);

        if (todayFacts == null || todayFacts.isEmpty()) {

            logger.info("Nenhum fato do dia encontrado no banco de dados. Solicitando novos fatos ao Groq.");

            factsRepository.deleteAll();

            List<Facts> newFactsList = new ArrayList<>();

            for (int i = 0; i <= 4; i++) {
                logger.info("Solicitando fato {} ao Groq.", i + 1);
                String receivedFacts = groqAiService.getFacts();

                Facts factRef = new Facts();
                factRef.setText(receivedFacts);
                factRef.setCreatedAt(LocalDateTime.now());

                Facts savedFact = factsRepository.save(factRef);
                newFactsList.add(savedFact);
            }

            return newFactsList.stream()
                    .map(f -> new FactsResponse(f.getId(), f.getText()))
                    .toList();

        } else {
            logger.info("Fatos do dia já existem no banco de dados. Retornando fatos existentes.");
            return todayFacts.stream()
                    .map(f -> new FactsResponse(f.getId(), f.getText()))
                    .toList();
        }
    }

}
