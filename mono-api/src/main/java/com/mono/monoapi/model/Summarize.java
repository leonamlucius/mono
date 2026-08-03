package com.mono.monoapi.model;

import java.time.LocalDateTime;

import jakarta.persistence.*;
import lombok.*;


@Entity
@Table(name = "summarizes")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Summarize {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(columnDefinition = "TEXT")
    private String text;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
}
