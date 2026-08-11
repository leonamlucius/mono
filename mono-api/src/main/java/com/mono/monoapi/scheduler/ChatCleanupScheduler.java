package com.mono.monoapi.scheduler;

import com.mono.monoapi.repository.ChatMessageRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.beans.factory.annotation.Autowired;
import java.time.LocalDateTime;

@Component
public class ChatCleanupScheduler {

    private static final Logger logger = LoggerFactory.getLogger(ChatCleanupScheduler.class);

    @Autowired
    private ChatMessageRepository repository;

    // Pega o tempo de retenção do application.properties (padrão: 30 dias)
    @Value("${app.chat.retention-days:30}")
    private int retentionDays;

    // Cron: "segundo minuto hora dia mês dia-da-semana"
    // "0 0 3 * * ?" = Executa diariamente às 03:00 AM
    @Scheduled(cron = "0 0 3 * * ?")
    public void cleanupOldMessages() {
        LocalDateTime cutoffDate = LocalDateTime.now().minusDays(retentionDays);
        logger.info("Iniciando limpeza automática de mensagens anteriores a: {}", cutoffDate);

        try {
            repository.deleteByCreatedAtBefore(cutoffDate);
            logger.info("Limpeza do histórico de chat concluída com sucesso.");
        } catch (Exception e) {
            logger.error("Falha ao executar limpeza automática do histórico de chat", e);
        }
    }
}
