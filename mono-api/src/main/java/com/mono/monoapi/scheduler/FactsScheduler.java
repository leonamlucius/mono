package com.mono.monoapi.scheduler;

import com.mono.monoapi.model.Facts;
import com.mono.monoapi.service.GroqAiService;
import com.mono.monoapi.repository.FactsRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Component;

@Component
public class FactsScheduler {

    private static final Logger logger = LoggerFactory.getLogger(FactsScheduler.class);

    @Autowired
    private FactsRepository factsRepository;

    @Autowired
    private GroqAiService groqAiService;

    @Value("${app.facts.retention-days:1}")
    private int retentionDays;

    @Scheduled(cron = "0 0 0 * * ?")
    @Transactional
    public void cleanupOldFacts() {
        LocalDateTime cutoffDate = LocalDateTime.now().minusDays(retentionDays);
        logger.info("Iniciando limpeza automática de fatos anteriores a: {}", cutoffDate);

        try {

            factsRepository.deleteByCreatedAtBefore(cutoffDate);
            logger.info("Limpeza do histórico de fatos concluída com sucesso.");

            List<Facts> newFactsList = new ArrayList<>();

            for (int i = 0; i <= 4; i++) {
                logger.info("Solicitando fato {} ao Groq.", i + 1);
                String receivedFacts = groqAiService.getFacts();

                if (receivedFacts == null || receivedFacts.isEmpty()) {
                    logger.warn("Fato {} recebido do Groq está vazio.", i + 1);
                    return;
                }

                Facts factRef = new Facts();
                factRef.setText(receivedFacts);
                factRef.setCreatedAt(LocalDateTime.now());

                newFactsList.add(factRef);
            }

            if (!newFactsList.isEmpty()) {
                factsRepository.saveAll(newFactsList);
                logger.info("Novos fatos salvos com sucesso.");
            }

            return;

        } catch (Exception e) {
            logger.error("Falha ao executar limpeza automática do histórico de fatos", e);
        }
    }

}
