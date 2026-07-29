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

@Service
public class FactsService {

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

            factsRepository.deleteAll();

            List<Facts> newFactsList = new ArrayList<>();

            for (int i = 0; i <= 4; i++) {
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
            return todayFacts.stream()
                    .map(f -> new FactsResponse(f.getId(), f.getText()))
                    .toList();
        }
    }

}
