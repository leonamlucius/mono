package com.mono.monoapi.config;

import org.springframework.ai.chat.model.ChatModel;
import org.springframework.ai.openai.OpenAiChatModel;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

@Configuration
public class AiConfig {

    @Bean
    @Primary
    public ChatModel defaultChatModel(OpenAiChatModel openAiChatModel) {
        // Isso resolve o erro de inicialização do Spring Boot
        return openAiChatModel; 
    }
}