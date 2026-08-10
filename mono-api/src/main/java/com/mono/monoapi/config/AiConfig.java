package com.mono.monoapi.config;

import com.mono.monoapi.config.PgSqlChatMemory;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.memory.ChatMemory;
import org.springframework.ai.chat.memory.InMemoryChatMemory;
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
        return openAiChatModel;
    }

    @Bean
    public ChatMemory chatMemory(PgSqlChatMemory pgSqlChatMemory) {
        return pgSqlChatMemory;
    }

    @Bean
    public ChatClient chatClient(ChatClient.Builder builder) {
        return builder.build();
    }

}