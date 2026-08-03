package com.mono.monoapi.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import java.util.HashMap;
import java.util.Map;

@Service
public class AssemblyAiService {

    @Value("${assemblyai.api.key}")
    private String apiKey;

    private final RestTemplate restTemplate = new RestTemplate();
    private final String baseUrl = "https://api.assemblyai.com/v2";

    public String transcreverAudio(byte[] audioBytes) throws Exception {

        if (audioBytes == null || audioBytes.length == 0) {
            throw new IllegalArgumentException("O áudio não pode estar vazio.");
        }
        String uploadUrl = realizarUpload(audioBytes);

        String transcriptId = iniciarTranscricao(uploadUrl);

        return aguardarTranscricao(transcriptId);
    }

    public String realizarUpload(byte[] audioBytes) {
        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", apiKey);
        headers.setContentType(MediaType.APPLICATION_OCTET_STREAM);

        HttpEntity<byte[]> requestEntity = new HttpEntity<>(audioBytes, headers);
        ResponseEntity<Map> response = restTemplate.postForEntity(baseUrl + "/upload", requestEntity, Map.class);

        return (String) response.getBody().get("upload_url");
    }

    private String iniciarTranscricao(String uploadUrl) {
        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", apiKey);
        headers.setContentType(MediaType.APPLICATION_JSON);

        Map<String, String> body = new HashMap<>();
        body.put("audio_url", uploadUrl);
        body.put("language_code", "pt");

        HttpEntity<Map<String, String>> request = new HttpEntity<>(body, headers);
        ResponseEntity<Map> response = restTemplate.postForEntity(baseUrl + "/transcript", request, Map.class);

        return (String) response.getBody().get("id");
    }

    private String aguardarTranscricao(String transcriptId) throws InterruptedException {
        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", apiKey);
        HttpEntity<Void> request = new HttpEntity<>(headers);

        while (true) {
            ResponseEntity<Map> response = restTemplate.exchange(
                    baseUrl + "/transcript/" + transcriptId,
                    HttpMethod.GET,
                    request,
                    Map.class);

            String status = (String) response.getBody().get("status");

            if ("completed".equals(status)) {
                return (String) response.getBody().get("text");
            } else if ("failed".equals(status)) {
                throw new RuntimeException("Falha na transcrição do áudio pela AssemblyAI.");
            }
            Thread.sleep(1500);
        }
    }

}
