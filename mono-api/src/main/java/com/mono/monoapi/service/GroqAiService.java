package com.mono.monoapi.service;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.openai.OpenAiChatModel;
import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.ai.chat.memory.InMemoryChatMemory;
import org.springframework.ai.chat.client.advisor.MessageChatMemoryAdvisor;



import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;


import groovy.transform.AutoExternalize;

@Service
public class GroqAiService {

    private static final List<String> TERMOS_PROIBIDOS = List.of("hacker", "scrpit malicioso", "ataque cibernético", "phishing", "malware", "ransomware", "spyware", "adware", "keylogger", "rootkit", "botnet", "exploit", "vulnerabilidade", "zero-day", "DDoS", "SQL injection", "cross-site scripting", "XSS", "CSRF", "flooding", "spoofing", "sniffer", "backdoor", "trojan", "worm");

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
            .defaultAdvisors(new MessageChatMemoryAdvisor(new InMemoryChatMemory()))
            .build();
    }

    // Criamos o builder usando o modelo da OpenAI (Groq)
    public GroqAiService(OpenAiChatModel openAiChatModel) {
        this.chatClient = ChatClient.builder(openAiChatModel).build();
    }

    public String chat(String message, String chatId) {
       
        logger.info("Iniciando chamada Groq via ChatClient para a mensagem: {}", message);

         for (String termo : TERMOS_PROIBIDOS) {
            if (message.toLowerCase().contains(termo.toLowerCase())) {
                logger.warn("Mensagem contém termo proibido: {}", termo);
                return "Desculpe, sua mensagem contém conteúdo proibido.";
            }
        }
        return this.chatClient.prompt(message)
        .advisors(a -> a.param(MessageChatMemoryAdvisor.CHAT_MEMORY_CONVERSATION_ID_KEY, chatId))
        .call()
        .content();
    }
}