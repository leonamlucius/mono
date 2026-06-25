package com.mono.monoapi.service;

import com.mono.monoapi.config.JwtUtil;
import com.mono.monoapi.dto.LoginRequest;
import com.mono.monoapi.dto.LoginResponse;
import com.mono.monoapi.dto.RegisterRequest;
import com.mono.monoapi.model.Login;
import com.mono.monoapi.repository.LoginRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Autowired; 
import org.springframework.context.annotation.Lazy;

@Service
@RequiredArgsConstructor
public class LoginService {

    private final LoginRepository loginRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    @Autowired
    @Lazy
    private AuthenticationManager authenticationManager;


    public LoginResponse register(RegisterRequest request) {
        // Check if the username already exists
        if (loginRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email já está em uso.");
        }

        // Create a new user and save it to the database
        Login user = Login.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .build();

        loginRepository.save(user);

        String token = jwtUtil.generateToken(user.getEmail());

        return new LoginResponse(user.getId(), token, user.getEmail());
    }

    public LoginResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword()));

        Login user = loginRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("Usuário não encontrado."));

        String token = jwtUtil.generateToken(user.getEmail());
        return new LoginResponse(user.getId(), token, user.getEmail());
    }

}
