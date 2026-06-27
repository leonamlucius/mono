package com.mono.monoapi.controller;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.model.ChatResponse;
import org.springframework.boot.autoconfigure.AutoConfigureOrder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.beans.factory.annotation.Autowired;
import com.mono.monoapi.service.GroqAiService;
import com.mono.monoapi.service.OllamaAiService;
import com.mono.monoapi.service.LoginService;
import jakarta.validation.Valid;

import jakarta.validation.constraints.Positive;
import org.springframework.http.ResponseEntity;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import com.mono.monoapi.dto.ChatResponseDTO;
import com.mono.monoapi.dto.LoginResponse;
import com.mono.monoapi.dto.LoginRequest;
import com.mono.monoapi.dto.RegisterRequest;

@RestController
@RequestMapping("/api")
public class MonoController {

    private static final Logger logger = LoggerFactory.getLogger(MonoController.class);

    @Autowired
    public GroqAiService groqAiService;


    @Autowired
    public OllamaAiService ollamaAiService;

    @Autowired
    public LoginService loginService;
   
    @PostMapping("/chat")
    public ResponseEntity<ChatResponseDTO> chat(@RequestBody String message, @RequestHeader(value = "X-AI-Provider", defaultValue = "GROQ") String provider, @RequestParam(defaultValue = "usuario-atual") String chatId) {
        if ("OLLAMA".equalsIgnoreCase(provider)) {

            try{
                String response = ollamaAiService.chat(message, chatId);
                return ResponseEntity.ok(new ChatResponseDTO(response, "OLLAMA-qwen2.5:0.5b", "SUCCESS"));
            }catch (Exception e) {
                logger.info("Erro ao processar a mensagem com Ollama, passando para Groq: '{}'. Detalhes do erro: {}", message, e.getMessage());
                String response = groqAiService.chat(message, chatId);
                return ResponseEntity.ok(new ChatResponseDTO(response, "GROQ-openai/gpt-oss-20b", "ERROR: Ollama falhou, mas Groq respondeu com sucesso."));
            }

        } else {

            try{
                String response = groqAiService.chat(message, chatId);
                return ResponseEntity.ok(new ChatResponseDTO(response, "GROQ-openai/gpt-oss-20b", "SUCCESS"));
            }catch (Exception e) {
                logger.info("Erro ao processar a mensagem com Groq: '{}'. Detalhes do erro: {}", message, e.getMessage());
                String response = ollamaAiService.chat(message, chatId);
                return ResponseEntity.ok(new ChatResponseDTO(response, "OLLAMA-qwen2.5:0.5b", "ERROR: Groq falhou, mas Ollama respondeu com sucesso."));
            }
        }
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(loginService.login(request));
    }

    @PostMapping("/register")
    public ResponseEntity<LoginResponse> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.ok(loginService.register(request));
    }

    @GetMapping("/facts")
    public ResponseEntity<String> getFacts() {
        String facts = groqAiService.getFacts();
        return ResponseEntity.ok(facts);
    }

    
}
