package com.mono.monoapi.repository;

import com.mono.monoapi.model.Login;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface LoginRepository extends JpaRepository<Login, Long> {
    
    Optional<Login> findByEmail(String email);
    boolean existsByEmail(String email);
}
