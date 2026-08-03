package com.mono.monoapi.service;

import com.mono.monoapi.config.JwtUtil;
import com.mono.monoapi.dto.UserRequest;
import com.mono.monoapi.dto.UserResponse;
import com.mono.monoapi.dto.UserInfoResponse;
import com.mono.monoapi.dto.UserInfoRequest;

import java.time.LocalDateTime;
import java.util.UUID;
import com.mono.monoapi.dto.RegisterRequest;
import com.mono.monoapi.model.PasswordResetToken;
import com.mono.monoapi.model.User;
import com.mono.monoapi.repository.TokenRepository;
import com.mono.monoapi.repository.UserRepository;

import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.http.HttpStatus;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.beans.factory.annotation.Value;

@Service
@RequiredArgsConstructor
public class UserService {

    @Autowired
    @Lazy
    private AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    private final UserRepository loginRepository;

    private final TokenRepository tokenRepository;

    private final JavaMailSender mailSender;

    @Value("${jwt.secret}")
    private String secretKey;

    @Value("${jwt.expiration}")
    private long jwtExpiration;

    @Value("${URLORIGIN}")
    private String urlOrigin;

    public UserResponse register(RegisterRequest request) {

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email já está em uso.");
        }
        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .createdAt(LocalDateTime.now())
                .build();

        userRepository.save(user);

        return new UserResponse(user.getId(), user.getEmail(), user.getName());
    }

    public UserResponse login(UserRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword()));

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("Usuário não encontrado."));

        return new UserResponse(user.getId(), user.getEmail(), user.getName());
    }

    public UserInfoResponse getUserInfo(String bearerToken) {
        if (bearerToken == null) {
            throw new IllegalArgumentException("Token de autenticação inválido.");
        }

        String token = bearerToken;
        String idString = jwtUtil.extractUserIdFromToken(token);
        Long id = Long.parseLong(idString);

        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Usuário não encontrado."));

        return new UserInfoResponse(user.getEmail(), user.getName(), user.getCreatedAt());
    }

    public UserInfoResponse updateUserInfo(UserInfoRequest request, String bearerToken) {

        if (bearerToken == null) {
            throw new IllegalArgumentException("Token de autenticação inválido.");
        }

        String token = bearerToken;
        String idString = jwtUtil.extractUserIdFromToken(token);
        Long id = Long.parseLong(idString);

        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Usuário não encontrado."));

        user.setName(request.getName());
        userRepository.save(user);

        return new UserInfoResponse(user.getEmail(), user.getName(), user.getCreatedAt());
    }

    public void forgotPassword(String email) {

        User user = loginRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Usuário não encontrado com o email: " + email));

        String token = UUID.randomUUID().toString();
        PasswordResetToken resetToken = tokenRepository.findByUser(user)
                .orElse(new PasswordResetToken());

        resetToken.setToken(token);
        resetToken.setUser(user);
        resetToken.setExpiryDate(LocalDateTime.now().plusHours(1));

        tokenRepository.save(resetToken);

        String urlDoFront = urlOrigin + "/reset-password?token=" + token;

        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(user.getEmail());
        message.setSubject("Recuperação de Senha - Mono");
        message.setText("Olá, " + user.getName() + "!\n\n" +
                "Você solicitou a alteração de sua senha. Clique no link abaixo para cadastrar uma nova senha:\n" +
                urlDoFront + "\n\n" +
                "Este link é válido 1 hora. Se você não solicitou a alteração de senha, por favor ignore este e-mail.\n\n");

        mailSender.send(message);

    }

    public String resetPassword(String token, String newPassword) {
        PasswordResetToken resetToken = tokenRepository.findByToken(token)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Token inválido"));
        if (resetToken.getExpiryDate().isBefore(LocalDateTime.now())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Token expirado");
        }
        User user = resetToken.getUser();
        user.setPassword(passwordEncoder.encode(newPassword));
        loginRepository.save(user);
        tokenRepository.delete(resetToken);
        return "Password reset successful for token: " + token;
    }

    public boolean tokenIsExpired(String token) {
        PasswordResetToken resetToken = tokenRepository.findByToken(token)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Token inválido"));
        return resetToken.getExpiryDate().isBefore(LocalDateTime.now());
    }

}
