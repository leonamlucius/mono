package com.mono.monoapi.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PatchMapping;
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
import com.mono.monoapi.dto.UserInfoResponse;
import com.mono.monoapi.dto.UserInfoRequest;
import java.util.List;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;

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
    public ResponseEntity<ChatResponseDTO> chat(@RequestBody String message,
            @RequestHeader(value = "X-AI-Provider", defaultValue = "GROQ") String provider,
            HttpServletRequest request) {

        String token = null;

        Cookie[] cookies = request.getCookies();
        if (cookies != null) {
            for (Cookie cookie : cookies) {
                if ("jwt".equals(cookie.getName())) {
                    token = cookie.getValue();
                    break;
                }
            }
        }

        logger.info("Recebida solicitação de chat com mensagem: '{}', provedor: '{}', token: '{}'", message, provider,
                token);

        String ChatId = "usuario-anonimo";

        if (token != null) {

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
            return ResponseEntity.status(401)
                    .body(new ChatResponseDTO(null, null, "ERROR: Nenhum token de autorização fornecido."));
        }

        if ("OLLAMA".equalsIgnoreCase(provider)) {

            try {
                String response = ollamaAiService.chat(message, ChatId);
                return ResponseEntity.ok(new ChatResponseDTO(response, "OLLAMA-qwen2.5:0.5b", "SUCCESS"));
            } catch (Exception e) {
                logger.info("Erro ao processar a mensagem com Ollama, passando para Groq: '{}'. Detalhes do erro: {}",
                        message, e.getMessage());
                String response = groqAiService.chat(message, ChatId);
                return ResponseEntity.ok(new ChatResponseDTO(response, "GROQ-openai/gpt-oss-20b",
                        "ERROR: Ollama falhou, mas Groq respondeu com sucesso."));
            }

        } else {

            try {
                String response = groqAiService.chat(message, ChatId);
                return ResponseEntity.ok(new ChatResponseDTO(response, "GROQ-openai/gpt-oss-20b", "SUCCESS"));
            } catch (Exception e) {
                logger.info("Erro ao processar a mensagem com Groq: '{}'. Detalhes do erro: {}", message,
                        e.getMessage());
                String response = ollamaAiService.chat(message, ChatId);
                return ResponseEntity.ok(new ChatResponseDTO(response, "OLLAMA-qwen2.5:0.5b",
                        "ERROR: Groq falhou, mas Ollama respondeu com sucesso."));
            }
        }
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest request, HttpServletResponse response) {
        LoginResponse loginResponse = loginService.login(request);

        Cookie jwtCookie = new Cookie("jwt",
                jwtUtil.generateToken(loginResponse.getEmail(), loginResponse.getId().toString()));
                                                                                                   
                                                                                                    
        jwtCookie.setHttpOnly(true); 
        jwtCookie.setSecure(true); 
        jwtCookie.setPath("/");
        jwtCookie.setMaxAge(60 * 60); 
        jwtCookie.setAttribute("SameSite", "Strict"); 

        response.addCookie(jwtCookie);
        return ResponseEntity.ok(loginResponse);
    }

    @PostMapping("/register")
    public ResponseEntity<LoginResponse> register(@Valid @RequestBody RegisterRequest request,
            HttpServletResponse response) {
        LoginResponse loginResponse = loginService.register(request);

        Cookie jwtCookie = new Cookie("jwt",
                jwtUtil.generateToken(loginResponse.getEmail(), loginResponse.getId().toString())); 
                                                                                                    
                                                                                                    
        jwtCookie.setHttpOnly(true); 
        jwtCookie.setSecure(true);
        jwtCookie.setPath("/");
        jwtCookie.setMaxAge(60 * 60); 
        jwtCookie.setAttribute("SameSite", "Strict");

        response.addCookie(jwtCookie);
        return ResponseEntity.ok(loginResponse);

    }

    @PostMapping("/logout")
    public ResponseEntity<String> logout(HttpServletResponse response) {
        Cookie jwtCookie = new Cookie("jwt", null);
        jwtCookie.setHttpOnly(true);
        jwtCookie.setSecure(true);
        jwtCookie.setPath("/");
        jwtCookie.setMaxAge(0); // 🟢 Expira imediatamente
        response.addCookie(jwtCookie);

        return ResponseEntity.ok("Logout realizado com sucesso");
    }

    @GetMapping("/get-user-info")
    public ResponseEntity<UserInfoResponse> getUserInfo(
            HttpServletRequest request) {
        String token = null;
        Cookie[] cookies = request.getCookies();
        if (cookies != null) {
            for (Cookie cookie : cookies) {
                if ("jwt".equals(cookie.getName())) {
                    token = cookie.getValue();
                    break;
                }
            }
        }
        UserInfoResponse user = loginService.getUserInfo(token);
        return ResponseEntity.ok(user);
    }

    @PatchMapping("/get-user-info")
    public ResponseEntity<UserInfoResponse> updateUserInfo(@Valid @RequestBody UserInfoRequest request,
            HttpServletRequest httpRequest) {

        String bearerToken = null;
        Cookie[] cookies = httpRequest.getCookies();
        if (cookies != null) {
            for (Cookie cookie : cookies) {
                if ("jwt".equals(cookie.getName())) {
                    bearerToken = cookie.getValue();
                    break;
                }
            }
        }

        UserInfoResponse user = loginService.updateUserInfo(request, bearerToken);
        return ResponseEntity.ok(user);
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
    public ResponseEntity<Boolean> jwtTest(
            HttpServletRequest request) {

        String token = null;
        Cookie[] cookies = request.getCookies();
        if (cookies != null) {
            for (Cookie cookie : cookies) {
                if ("jwt".equals(cookie.getName())) {
                    token = cookie.getValue();
                    break;
                }
            }
        }

        if (token == null) {
            return ResponseEntity.status(401).body(false);
        }

        boolean isValid = jwtUtil.isTokenValid(token);
        return ResponseEntity.ok(isValid);
    }

    @PostMapping("/transcribe")
    public ResponseEntity<String> transcribe(@RequestParam("file") MultipartFile file,
            HttpServletRequest request) {


        if (request == null) {
            return ResponseEntity.badRequest().body("Cookie de autorização não fornecida");
        }

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
    public ResponseEntity<String> summarize(
            HttpServletRequest request) {
        try {
            String bearerToken = null;
            Cookie[] cookies = request.getCookies();
            if (cookies != null) {
                for (Cookie cookie : cookies) {
                    if ("jwt".equals(cookie.getName())) {
                        bearerToken = cookie.getValue();
                        break;
                    }
                }
            }
            String summary = summarizeService.summarizeText(bearerToken);
            return ResponseEntity.ok(summary);
        } catch (Exception e) {
            logger.error("Erro ao resumir o texto: {}", e.getMessage());
            return ResponseEntity.status(500).body("Erro ao resumir o texto");
        }
    }

}
