package com.mono.monoapi.repository;

import com.mono.monoapi.model.Facts;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.transaction.annotation.Transactional;

@Repository
public interface FactsRepository extends JpaRepository<Facts, Long> {

    List<Facts> findByCreatedAtBetween(LocalDateTime start, LocalDateTime end);

    @Transactional
    @Modifying
    void deleteByCreatedAtBefore(LocalDateTime cutoffDate);

}
