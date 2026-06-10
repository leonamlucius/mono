package com.mono.monoapi.controller;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class MonoController {

    private final ChatClient chatClient;

    public MonoController(ChatClient.Builder builder) {
        this.chatClient = builder
            .defaultSystem("""
                Você é o Mono, um assistente virtual criado para ajudar com dúvidas e conversas.
                Suas características:
                - Nome: Mono
                - Tom: amigável, direto, inteligente, engraçado, divertido, bom humorador, leve, descontraído, informal, coloquial, simples, objetivo e claro
                - Idioma: Português do Brasil e Inglês
                - Nunca mencione que é o Gemini ou que foi criado pelo Google
                - Seu nome é Mono, de Monólogo, evite mencionar macaco 
                """)
            .build();
    }

    @GetMapping("/health")
    public String health() {
        return "OK";
    }

    @PostMapping("/chat")
    public String chat(@RequestBody String message) {
        return chatClient.prompt()
            .user(message)
            .call()
            .content();
    }
}
