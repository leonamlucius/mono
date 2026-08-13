package com.mono.monoapi.service;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import com.mono.monoapi.dto.RegisterRequest;

import com.mono.monoapi.dto.UserResponse;

import com.mono.monoapi.config.JwtUtil;
import com.mono.monoapi.model.User;

import com.mono.monoapi.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import java.util.UUID;

import org.springframework.http.ResponseEntity;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.Collections;

@Service
public class GoogleAuthService {

    @Autowired
    private UserService userService;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private UserRepository userRepository;

    @Value("${google.client.id}")
    private String clientId;

    public GoogleIdToken.Payload verifyToken(String idTokenString) throws Exception {

        if (idTokenString == null || idTokenString.isEmpty()) {
            throw new IllegalArgumentException("ID token do Google não pode ser nulo ou vazio.");
        }
        try {
            GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(
                    new NetHttpTransport(),
                    GsonFactory.getDefaultInstance())
                    .setAudience(Collections.singletonList(clientId))
                    .build();

            GoogleIdToken idToken = verifier.verify(idTokenString);

            if (idToken != null) {
                return idToken.getPayload();
            } else {
                throw new IllegalArgumentException("Token do Google inválido ou expirado.");
            }
        } catch (Exception e) {
            throw new RuntimeException("Erro ao validar token com o Google", e);
        }
    }

    public ResponseEntity<UserResponse> registerWithGoogle(String idTokenString) {
        try {

            GoogleIdToken.Payload payload = verifyToken(idTokenString);

            String email = payload.getEmail();
            String name = (String) payload.get("name");
            String password = UUID.randomUUID().toString() + UUID.randomUUID().toString();

            RegisterRequest registerRequest = new RegisterRequest();
            registerRequest.setName(name);
            registerRequest.setEmail(email);
            registerRequest.setPassword(password);

            boolean userExists = userRepository.existsByEmail(email);

            if (userExists) {
                throw new IllegalArgumentException("Usuário com o email " + email + " já existe.");
            }

            UserResponse userResponse = userService.register(registerRequest);

            return ResponseEntity.ok(userResponse);

        } catch (Exception e) {
            throw new RuntimeException("Erro ao registrar usuário com o Google", e);
        }
    }

    public ResponseEntity<UserResponse> loginWithGoogle(String idTokenString) {
        try {
            GoogleIdToken.Payload payload = verifyToken(idTokenString);
            String email = payload.getEmail();

            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new IllegalArgumentException("Usuário não cadastrado no sistema."));

            UserResponse response = new UserResponse(user.getId(), user.getEmail(), user.getName());
            return ResponseEntity.ok(response);

        } catch (IllegalArgumentException e) {
            throw e;
        } catch (Exception e) {
            throw new RuntimeException("Erro ao fazer login com o Google", e);
        }
    }
}
