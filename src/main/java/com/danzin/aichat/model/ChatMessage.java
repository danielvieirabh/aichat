package com.danzin.aichat.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "chat_messages")
@NoArgsConstructor
@Data
public class ChatMessage {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String sessionId;
    @Column(columnDefinition = "TEXT")
    private String content;
    private String role;
    private LocalDateTime timestamp;
}