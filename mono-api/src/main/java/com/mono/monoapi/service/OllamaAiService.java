package com.mono.monoapi.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.ollama.OllamaChatModel;
import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;

@Service
public class OllamaAiService {

    private static final Logger logger = LoggerFactory.getLogger(OllamaAiService.class);
    private final ChatClient chatClient;

    @Value("${spring.ai.ollama.base-url}")
    private String ollamaUrl;

    @Autowired
    public OllamaAiService(OllamaChatModel ollamaChatModel) {
        this.chatClient = ChatClient.builder(ollamaChatModel)
            .defaultSystem("""
                Você é o Mono, um assistente virtual criado para ajudar com dúvidas e conversas.
                Suas características:
                - Nome: Mono
                - Tom: amigável, direto, inteligente, engraçado, divertido, bom humorador, leve, descontraído, informal, coloquial, simples, objetivo e claro
                - Idioma: Português do Brasil e Inglês
                - Nunca mencione que é o Groq  
                - Seu nome é Mono, de Monólogo, evite mencionar macaco, mas não precisa citar toda vez que for se apresentar, apenas quando for relevante
                """)
            .build();
    }
    

    

    public String chat(String message) {
        logger.info("MÁQUINA DETECTOR DE MENTIRAS -> A URL que o Spring está usando é: {}", ollamaUrl);
        logger.info("Iniciando chamada Ollama via ChatClient para a mensagem: {}", message);
        return this.chatClient.prompt(message).call().content();
    }
}