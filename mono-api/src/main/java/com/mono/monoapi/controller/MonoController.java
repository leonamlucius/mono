package com.mono.monoapi.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.beans.factory.annotation.Autowired;
import com.mono.monoapi.service.GroqAiService;
import com.mono.monoapi.service.OllamaAiService;
import com.mono.monoapi.service.LoginService;
import com.mono.monoapi.service.ResetPasswordService;
import com.mono.monoapi.service.AssemblyAiService;
import com.mono.monoapi.service.SummarizeService;
import com.mono.monoapi.service.FactsService;
import jakarta.validation.Valid;

import jakarta.validation.constraints.Positive;
import org.springframework.http.ResponseEntity;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.mono.monoapi.config.JwtUtil;
import com.mono.monoapi.dto.ChatResponseDTO;
import com.mono.monoapi.dto.LoginResponse;
import com.mono.monoapi.dto.LoginRequest;
import com.mono.monoapi.dto.RegisterRequest;
import com.mono.monoapi.dto.ResetPasswordRequest;
import com.mono.monoapi.dto.ForgotPasswordRequest;
import com.mono.monoapi.dto.FactsResponse;
import java.util.List;


@RestController
@RequestMapping("/api")
public class MonoController {

    private static final Logger logger = LoggerFactory.getLogger(MonoController.class);

    @Autowired
    public GroqAiService groqAiService;


    @Autowired
    public OllamaAiService ollamaAiService;


    @Autowired
    public ResetPasswordService resetPasswordService;

    @Autowired
    public LoginService loginService;


    @Autowired
    public AssemblyAiService assemblyAiService;

    @Autowired
    public SummarizeService summarizeService;

    @Autowired
    public FactsService factsService;


    @Autowired
    private JwtUtil jwtUtil;
   
    @PostMapping("/chat")
    public ResponseEntity<ChatResponseDTO> chat(@RequestBody String message, @RequestHeader(value = "X-AI-Provider", defaultValue = "GROQ") String provider, @RequestHeader(value = "Authorization", required = true) String bearerToken) {


        logger.info("Recebida solicitação de chat com mensagem: '{}', provedor: '{}', token: '{}'", message, provider, bearerToken);

        String ChatId = "usuario-anonimo"; 


        if(bearerToken != null) {
            String token = bearerToken.substring(7).trim();

            token = token.replaceAll("[\\p{Cntrl}]", "");
            try {
                ChatId = jwtUtil.extractUserIdFromToken(token);

                logger.info("ID do usuário extraído do token: '{}'", ChatId);
            } catch (Exception e) {
                logger.info("Erro ao extrair o ID do usuário do token: {}", e.getMessage());
                return ResponseEntity.status(401).body(new ChatResponseDTO(null, null, "ERROR: Token inválido."));
            }
        } else {
            logger.info("Nenhum token de autorização fornecido. Usando ID de chat padrão: '{}'", ChatId);
            return ResponseEntity.status(401).body(new ChatResponseDTO(null, null, "ERROR: Nenhum token de autorização fornecido."));
        }

       



        if ("OLLAMA".equalsIgnoreCase(provider)) {

            try{
                String response = ollamaAiService.chat(message, ChatId);
                return ResponseEntity.ok(new ChatResponseDTO(response, "OLLAMA-qwen2.5:0.5b", "SUCCESS"));
            }catch (Exception e) {
                logger.info("Erro ao processar a mensagem com Ollama, passando para Groq: '{}'. Detalhes do erro: {}", message, e.getMessage());
                String response = groqAiService.chat(message, ChatId);
                return ResponseEntity.ok(new ChatResponseDTO(response, "GROQ-openai/gpt-oss-20b", "ERROR: Ollama falhou, mas Groq respondeu com sucesso."));
            }

        } else {

            try{
                String response = groqAiService.chat(message, ChatId);
                return ResponseEntity.ok(new ChatResponseDTO(response, "GROQ-openai/gpt-oss-20b", "SUCCESS"));
            }catch (Exception e) {
                logger.info("Erro ao processar a mensagem com Groq: '{}'. Detalhes do erro: {}", message, e.getMessage());
                String response = ollamaAiService.chat(message, ChatId);
                return ResponseEntity.ok(new ChatResponseDTO(response, "OLLAMA-qwen2.5:0.5b", "ERROR: Groq falhou, mas Ollama respondeu com sucesso."));
            }
        }
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(loginService.login(request));
    }

    @PostMapping("/register")
    public ResponseEntity<LoginResponse> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.ok(loginService.register(request));
    }

    @GetMapping("/facts")
    public ResponseEntity<List<FactsResponse>> getFacts() {
        List<FactsResponse> facts = factsService.getFact();
        return ResponseEntity.ok(facts);
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<String> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        resetPasswordService.forgotPassword(request.email());
        return ResponseEntity.ok("Password reset link sent to email: " + request.email());
    }

    @PostMapping("/reset-password")
    public ResponseEntity<String> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        String response = resetPasswordService.resetPassword(request.token(), request.newPassword());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/token-test")
    public ResponseEntity<Boolean> tokenIsExpired(@RequestParam String token) {
        boolean isExpired = resetPasswordService.tokenIsExpired(token);
        return ResponseEntity.ok(isExpired);
    }

    @GetMapping("/jwt-test")
    public ResponseEntity<Boolean> jwtTest(@RequestHeader(value = "Authorization", required = true) String bearerToken) {
        if (bearerToken == null || !bearerToken.startsWith("Bearer ")) {
            return ResponseEntity.status(401).body(false);
        }
        String token = bearerToken.substring(7);
        boolean isValid = jwtUtil.isTokenValid(token);
        return ResponseEntity.ok(isValid);
    }

    @PostMapping("/transcribe")
    public ResponseEntity<String> transcribe(@RequestParam("file") MultipartFile file, @RequestHeader(value = "Authorization", required = true) String bearerToken) throws Exception {


        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body("Arquivo de áudio não fornecido");
        }

        try {
            String transcription = assemblyAiService.transcreverAudio(file.getBytes());
            return ResponseEntity.ok(transcription);
        } catch (Exception e) {
            logger.error("Erro ao transcrever o áudio: {}", e.getMessage());
            return ResponseEntity.status(500).body("Erro ao transcrever o áudio");
        }
    }


    @GetMapping("/summarize")
    public ResponseEntity<String> summarize(@RequestHeader(value = "Authorization", required = true) String bearerToken) {
        try {
            String summary = summarizeService.summarizeText(bearerToken);
            return ResponseEntity.ok(summary);
        } catch (Exception e) {
            logger.error("Erro ao resumir o texto: {}", e.getMessage());
            return ResponseEntity.status(500).body("Erro ao resumir o texto");
        }
    }




}
