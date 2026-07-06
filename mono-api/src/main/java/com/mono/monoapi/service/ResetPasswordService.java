package com.mono.monoapi.service;
import com.mono.monoapi.repository.LoginRepository;
import com.mono.monoapi.repository.TokenRepository;
import com.mono.monoapi.model.Login;
import com.mono.monoapi.model.PasswordResetToken;

import lombok.RequiredArgsConstructor;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.beans.factory.annotation.Value;

import java.util.UUID;
import java.time.LocalDateTime;



@Service
@RequiredArgsConstructor
public class ResetPasswordService {

    private final LoginRepository loginRepository;

    private final TokenRepository tokenRepository;

    private final JavaMailSender mailSender;

    private final PasswordEncoder passwordEncoder;


    @Value("${URLORIGIN}") 
    private String urlOrigin;

    public void forgotPassword(String email) {

        Login user = loginRepository.findByEmail(email)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuário não encontrado com o email: " + email));


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
        Login user = resetToken.getUser();
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
