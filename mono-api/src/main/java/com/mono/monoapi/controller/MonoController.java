package com.mono.monoapi.controller;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.boot.autoconfigure.AutoConfigureOrder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.beans.factory.annotation.Autowired;
import com.mono.monoapi.service.GroqAiService;
import com.mono.monoapi.service.OllamaAiService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@RestController
@RequestMapping("/api")
public class MonoController {

    private static final Logger logger = LoggerFactory.getLogger(MonoController.class);

    @Autowired
    public GroqAiService groqAiService;


    @Autowired
    public OllamaAiService ollamaAiService;

   
    @PostMapping("/chat")
    public String chat(@RequestBody String message, @RequestHeader(value = "X-AI-Provider", defaultValue = "GROQ") String provider) {
        if ("OLLAMA".equalsIgnoreCase(provider)) {

            try{
                return ollamaAiService.chat(message);
            }catch (Exception e) {
                logger.info("Erro ao processar a mensagem com Ollama, passando para Groq: '{}'. Detalhes do erro: {}", message, e.getMessage());
                return groqAiService.chat(message);
            }

        } else {

            try{
                return groqAiService.chat(message);
            }catch (Exception e) {
                logger.info("Erro ao processar a mensagem com Groq: '{}'. Detalhes do erro: {}", message, e.getMessage());
                return "Ocorreu um erro ao processar sua mensagem com Groq. Por favor, tente novamente." + e.getMessage();
            }
        }
    }
}
