package com.mono.monoapi.repository;

import com.mono.monoapi.model.Facts;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

@Repository
public interface FactsRepository extends JpaRepository<Facts, Long> {


    List<Facts> findByCreatedAtBetween(LocalDateTime start, LocalDateTime end);

}
