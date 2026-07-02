package com.mono.monoapi.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Data
@Table(name = "password_reset_tokens")
public class PasswordResetToken {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String token;

    @OneToOne(targetEntity = Login.class, fetch = FetchType.EAGER)
    @JoinColumn(nullable = false, name = "user_id")
    private Login user;

    @Column(nullable = false)
    private LocalDateTime expiryDate;

    // Verifica se o token passou do tempo estipulado
    public boolean isExpired() {
        return LocalDateTime.now().isAfter(this.expiryDate);
    }
}