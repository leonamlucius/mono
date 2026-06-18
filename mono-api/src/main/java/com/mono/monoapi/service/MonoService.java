package com.mono.monoapi.service;
import java.util.List;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;


@Service
public class MonoService {

    private static final Logger logger = LoggerFactory.getLogger(MonoService.class);

    private final ChatClient chatClient;

    private static final List<String> TERMOS_PROIBIDOS = List.of("hacker", "scrpit malicioso", "ataque cibernético", "phishing", "malware", "ransomware", "spyware", "adware", "keylogger", "rootkit", "botnet", "exploit", "vulnerabilidade", "zero-day", "DDoS", "SQL injection", "cross-site scripting", "XSS", "CSRF", "flooding", "spoofing", "sniffer", "backdoor", "trojan", "worm");


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


        String messageLower = message.toLowerCase();

        if (message == null || message.trim().isEmpty()) {
            logger.warn("Mensagem invalida recebida: '{}'", message);
            return "Por favor, envie uma mensagem válida.";
        }

        for (String termo : TERMOS_PROIBIDOS) {
            if (messageLower.contains(termo)) {
                logger.warn("Mensagem contem termos proibidos: '{}'", message);
                return "Desculpe, sua mensagem contém termos proibidos.";
            }
        }

        try{
            return chatClient.prompt()
            .user(message)
            .call()
            .content();
        }catch (Exception e) {
            logger.error("Erro ao processar a mensagem: '{}'. Detalhes do erro: {}", message, e.getMessage());
            return "Ocorreu um erro ao processar sua mensagem. Por favor, tente novamente." + e.getMessage();
        }  
    }



}
