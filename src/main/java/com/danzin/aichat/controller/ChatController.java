package com.danzin.aichat.controller;


import com.danzin.aichat.dto.ChatRequestDTO;
import com.danzin.aichat.dto.ChatResponseDTO;
import com.danzin.aichat.model.ChatMessage;
import com.danzin.aichat.service.ChatService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/chat")
@CrossOrigin(origins = "*")
public class ChatController {

    private final ChatService chatService;

    public ChatController(ChatService chatService) {
        this.chatService = chatService;
    }

    @PostMapping
    public ChatResponseDTO sendMessage(@RequestBody ChatRequestDTO request) {
        String sessionId = (request.sessionId() != null && !request.sessionId().isBlank())
                ? request.sessionId()
                : "default-session";

        String response = chatService.processMessage(sessionId, request.message());

        return new ChatResponseDTO(response);
    }

    @GetMapping("/{sessionId}")
    public List<ChatMessage> getHistory(@PathVariable String sessionId) {
        return chatService.getHistory(sessionId);
    }
}