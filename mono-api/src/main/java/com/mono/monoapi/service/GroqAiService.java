package com.mono.monoapi.service;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.client.advisor.MessageChatMemoryAdvisor;
import org.springframework.ai.chat.memory.ChatMemory;
import java.util.Map;
import org.springframework.ai.chat.messages.AssistantMessage;
import org.springframework.ai.chat.messages.Message;
import org.springframework.ai.chat.messages.UserMessage;
import org.springframework.ai.openai.OpenAiChatModel;
import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
public class GroqAiService {

    private static final List<String> TERMOS_PROIBIDOS = List.of("hacker", "script malicioso", "ataque cibernético",
            "phishing", "malware", "ransomware", "spyware", "adware", "keylogger", "rootkit", "botnet", "exploit",
            "vulnerabilidade", "zero-day", "DDoS", "SQL injection", "cross-site scripting", "XSS", "CSRF", "flooding",
            "spoofing", "sniffer", "backdoor", "trojan", "worm");

    private final ChatClient chatClient;
    private ChatMemory chatMemory;

    private static final Logger logger = LoggerFactory.getLogger(GroqAiService.class);

    @Autowired
    public GroqAiService(ChatClient.Builder builder, ChatMemory chatMemory) {
        this.chatClient = builder
                .defaultSystem(
                        """
                                Você é o Mono, um assistente virtual criado para ajudar com dúvidas e conversas.
                                Suas características:
                                - Nome: Mono
                                - Tom: amigável, direto, inteligente, engraçado, divertido, bom humorador, leve, descontraído, informal, coloquial, simples, objetivo e claro
                                - Idioma: Português do Brasil e Inglês
                                - Nunca mencione que é o Groq
                                - Seu nome é Mono, de Monólogo, evite mencionar macaco, mas não precisa citar toda vez que for se apresentar, apenas quando for relevante
                                """)
                .build();

        this.chatMemory = chatMemory;
    }

    public GroqAiService(OpenAiChatModel openAiChatModel) {
        this.chatClient = ChatClient.builder(openAiChatModel).build();
    }

    public String chat(String message, String chatId) {

        logger.info("Iniciando chamada Groq via ChatClient para a mensagem: {}", message);

        for (String termo : TERMOS_PROIBIDOS) {
            if (message.toLowerCase().contains(termo.toLowerCase())) {
                logger.warn("Mensagem contém termo proibido: {}", termo);
                throw new IllegalArgumentException("Mensagem contém termo proibido: " + termo);
            }
        }
        List<Message> history = this.chatMemory.get(chatId, 100);

        String response = this.chatClient.prompt()
                .messages(history)
                .user(message)
                .call()
                .content();

        this.chatMemory.add(chatId, new UserMessage(message));
        this.chatMemory.add(chatId, new AssistantMessage(response, Map.of("model", "GROQ-openai/gpt-oss-20b")));

        return response;
    }

    public String getFacts() {
        logger.info("Iniciando chamada Groq para obter fatos.");
        String prompt = "Forneça um fato curioso, não forneça mais de um fato, não forneça explicações, apenas o fato em uma frase curta.";
        return this.chatClient.prompt(prompt)
                .call()
                .content();

    }

}