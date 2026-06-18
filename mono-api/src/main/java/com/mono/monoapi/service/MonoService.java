package com.mono.monoapi.service;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.stereotype.Service;


@Service
public class MonoService {

    private final ChatClient chatClient;


    public MonoService(ChatClient.Builder builder) {
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


    public String chat(String message) {

        if (message == null || message.trim().isEmpty()) {
            return "Por favor, envie uma mensagem válida.";
        }

        try{
            return chatClient.prompt()
            .user(message)
            .call()
            .content();
        }catch (Exception e) {
            return "Ocorreu um erro ao processar sua mensagem. Por favor, tente novamente." + e.getMessage();
        }  
    }



}
