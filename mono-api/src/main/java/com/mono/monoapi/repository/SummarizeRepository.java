package com.mono.monoapi.repository;

import com.mono.monoapi.model.Summarize;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import org.springframework.stereotype.Repository;

@Repository
public interface SummarizeRepository extends JpaRepository<Summarize, Long> {
    Optional<Summarize> findByUserId(Long userId);
}
