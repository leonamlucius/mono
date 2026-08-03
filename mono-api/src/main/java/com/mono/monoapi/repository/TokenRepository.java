package com.mono.monoapi.repository;

import com.mono.monoapi.model.PasswordResetToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface TokenRepository extends JpaRepository<PasswordResetToken, Long> {
    
    // Método essencial para buscar o token e validar se ele existe no banco
    Optional<PasswordResetToken> findByToken(String token);

    // Método para buscar o token associado a um usuário específico
    Optional<PasswordResetToken> findByUser(com.mono.monoapi.model.User user);
}
