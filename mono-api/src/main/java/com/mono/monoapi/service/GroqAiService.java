package com.mono.monoapi.service;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.openai.OpenAiChatModel;
import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Autowired;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;


import groovy.transform.AutoExternalize;

@Service
public class GroqAiService {

    private final ChatClient chatClient;

    private static final Logger logger = LoggerFactory.getLogger(GroqAiService.class);

    @Autowired
      public GroqAiService(ChatClient.Builder builder) {
        this.chatClient = builder
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

    // Criamos o builder usando o modelo da OpenAI (Groq)
    public GroqAiService(OpenAiChatModel openAiChatModel) {
        this.chatClient = ChatClient.builder(openAiChatModel).build();
    }

    public String chat(String message) {
        logger.info("Iniciando chamada Groq via ChatClient para a mensagem: {}", message);
        return this.chatClient.prompt(message).call().content();
    }
}