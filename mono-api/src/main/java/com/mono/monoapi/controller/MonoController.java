package com.mono.monoapi.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.beans.factory.annotation.Autowired;
import com.mono.monoapi.service.GroqAiService;
import com.mono.monoapi.service.HistoryService;
import com.mono.monoapi.service.OllamaAiService;
import com.mono.monoapi.service.UserService;
import com.mono.monoapi.service.AssemblyAiService;
import com.mono.monoapi.service.SummarizeService;
import com.mono.monoapi.service.FactsService;
import com.mono.monoapi.service.CookieService;
import com.mono.monoapi.service.TtsService;
import org.springframework.http.ResponseEntity;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.mono.monoapi.config.JwtUtil;
import com.mono.monoapi.dto.ChatResponseDTO;
import com.mono.monoapi.dto.FactsResponse;
import java.util.List;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;

import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/mono")
public class MonoController {

    private static final Logger logger = LoggerFactory.getLogger(MonoController.class);

    @Autowired
    public GroqAiService groqAiService;

    @Autowired
    public OllamaAiService ollamaAiService;

    @Autowired
    public UserService userService;

    @Autowired
    public AssemblyAiService assemblyAiService;

    @Autowired
    public SummarizeService summarizeService;

    @Autowired
    public FactsService factsService;

    @Autowired
    public HistoryService historyService;

    @Autowired
    public CookieService cookieService;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private TtsService ttsService;

    @PostMapping("/chat")
    public ResponseEntity<ChatResponseDTO> chat(@RequestBody String message,
            @RequestHeader(value = "X-AI-Provider", defaultValue = "GROQ") String provider,
            HttpServletRequest request) {

        String token = cookieService.getJwtCookieFromRequest(request) != null
                ? cookieService.getJwtCookieFromRequest(request).getValue()
                : null;

        logger.info("Recebida solicitação de chat com mensagem: '{}', provedor: '{}', token: '{}'", message, provider,
                token);

        String ChatId = "usuario-anonimo";

        if (token != null) {

            token = token.replaceAll("[\\p{Cntrl}]", "");
            try {
                ChatId = jwtUtil.extractUserIdFromToken(token);

                logger.info("ID do usuário extraído do token: '{}'", ChatId);
            } catch (Exception e) {
                logger.info("Erro ao extrair o ID do usuário do token: {}", e.getMessage());
                return ResponseEntity.status(401).body(new ChatResponseDTO(null, null, "ERROR: Token inválido."));
            }
        } else {
            logger.info("Nenhum token de autorização fornecido. Usando ID de chat padrão: '{}'", ChatId);
            return ResponseEntity.status(401)
                    .body(new ChatResponseDTO(null, null, "ERROR: Nenhum token de autorização fornecido."));
        }

        if ("OLLAMA".equalsIgnoreCase(provider)) {

            try {
                String response = ollamaAiService.chat(message, ChatId);
                return ResponseEntity.ok(new ChatResponseDTO(response, "OLLAMA-qwen2.5:0.5b", "SUCCESS"));
            } catch (Exception e) {
                logger.info("Erro ao processar a mensagem com Ollama, passando para Groq: '{}'. Detalhes do erro: {}",
                        message, e.getMessage());
                String response = groqAiService.chat(message, ChatId);
                return ResponseEntity.ok(new ChatResponseDTO(response, "GROQ-openai/gpt-oss-20b",
                        "ERROR: Ollama falhou, mas Groq respondeu com sucesso."));
            }

        } else {

            try {
                String response = groqAiService.chat(message, ChatId);
                return ResponseEntity.ok(new ChatResponseDTO(response, "GROQ-openai/gpt-oss-20b", "SUCCESS"));
            } catch (Exception e) {
                logger.info("Erro ao processar a mensagem com Groq: '{}'. Detalhes do erro: {}", message,
                        e.getMessage());
                String response = ollamaAiService.chat(message, ChatId);
                return ResponseEntity.ok(new ChatResponseDTO(response, "OLLAMA-qwen2.5:0.5b",
                        "ERROR: Groq falhou, mas Ollama respondeu com sucesso."));
            }
        }
    }

    @GetMapping("/facts")
    public ResponseEntity<List<FactsResponse>> getFacts() {
        List<FactsResponse> facts = factsService.getFact();
        return ResponseEntity.ok(facts);
    }

    @PostMapping("/transcribe")
    public ResponseEntity<String> transcribe(@RequestParam("file") MultipartFile file,
            HttpServletRequest request) {

        if (request == null) {
            return ResponseEntity.badRequest().body("Cookie de autorização não fornecida");
        }

        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body("Arquivo de áudio não fornecido");
        }

        try {
            String transcription = assemblyAiService.transcreverAudio(file.getBytes());
            return ResponseEntity.ok(transcription);
        } catch (Exception e) {
            logger.error("Erro ao transcrever o áudio: {}", e.getMessage());
            return ResponseEntity.status(500).body("Erro ao transcrever o áudio");
        }
    }

    @GetMapping("/summarize")
    public ResponseEntity<String> summarize(
            HttpServletRequest request) {
        try {
            String bearerToken = cookieService.getJwtCookieFromRequest(request) != null
                    ? cookieService.getJwtCookieFromRequest(request).getValue()
                    : null;

            String summary = summarizeService.summarizeText(bearerToken);
            return ResponseEntity.ok(summary);
        } catch (Exception e) {
            logger.error("Erro ao resumir o texto: {}", e.getMessage());
            return ResponseEntity.status(500).body("Erro ao resumir o texto");
        }
    }

    @GetMapping("/history")
    public ResponseEntity<List<ChatResponseDTO>> getHistory(HttpServletRequest request) {
        String token = cookieService.getJwtCookieFromRequest(request) != null
                ? cookieService.getJwtCookieFromRequest(request).getValue()
                : null;

        String ChatId = "usuario-anonimo";

        if (token != null) {

            token = token.replaceAll("[\\p{Cntrl}]", "");
            try {
                ChatId = jwtUtil.extractUserIdFromToken(token);

                logger.info("ID do usuário extraído do token: '{}'", ChatId);
            } catch (Exception e) {
                logger.info("Erro ao extrair o ID do usuário do token: {}", e.getMessage());
                return ResponseEntity.status(401).body(null);
            }
        } else {
            logger.info("Nenhum token de autorização fornecido. Usando ID de chat padrão: '{}'", ChatId);
            return ResponseEntity.status(401).body(null);
        }

        List<ChatResponseDTO> response = historyService.getHistorico(ChatId);

        return ResponseEntity.ok(response);
    }

    @PostMapping(value = "/tts", produces = "audio/wav")
    public ResponseEntity<byte[]> getTts(@RequestParam String text,
            @RequestParam(defaultValue = "cadu") String voice) {

        try {

            byte[] audioBytes = ttsService.generateAudio(text, voice);
            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType("audio/wav"))
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"audio.wav\"")
                    .body(audioBytes);
        } catch (Exception e) {
            logger.error("Erro ao gerar áudio TTS: {}", e.getMessage());
            return ResponseEntity.status(500).body(null);
        }
    }

}
