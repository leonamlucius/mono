package com.mono.monoapi.service;

import java.util.Map;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import com.mono.monoapi.controller.MonoController;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
public class TtsService {

    private final RestClient restClient = RestClient.create();

    private static final Logger logger = LoggerFactory.getLogger(MonoController.class);

    public byte[] generateAudio(String text, String voice) {

        try {

            logger.info("Gerando áudio TTS com texto: '{}' e voz: '{}'", text, voice);

            String baseUrl = "cadu".equalsIgnoreCase(voice)
                    ? "http://127.0.0.1:5002/synthesize"
                    : "http://127.0.0.1:5001/synthesize";

            Map<String, String> requestBody = Map.of("text", text);

            return restClient.post()
                    .uri(baseUrl)
                    .contentType(MediaType.APPLICATION_JSON)
                    .accept(MediaType.parseMediaType("audio/wav"))
                    .body(requestBody)
                    .retrieve()
                    .body(byte[].class);

        } catch (Exception e) {
            logger.error("Erro ao gerar áudio TTS: {}", e.getMessage(), e);
            throw new RuntimeException("Erro ao gerar áudio TTS: " + e.getMessage(), e);
        }

    }
}
