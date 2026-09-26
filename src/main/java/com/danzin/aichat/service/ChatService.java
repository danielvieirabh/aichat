package com.danzin.aichat.service;

import com.danzin.aichat.model.ChatMessage;
import com.danzin.aichat.repository.ChatMessageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.messages.Message;
import org.springframework.ai.chat.messages.SystemMessage;
import org.springframework.ai.chat.messages.UserMessage;
import org.springframework.ai.chat.messages.AssistantMessage;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class ChatService {
    private final ChatClient chatClient;
    private final ChatMessageRepository chatMessageRepository;

    public ChatService(ChatClient.Builder chatClientBuilder, ChatMessageRepository chatMessageRepository) {
        this.chatClient = chatClientBuilder.build();
        this.chatMessageRepository = chatMessageRepository;
    }


    public String processMessage(String sessionId, String userText) {
        ChatMessage chatMessageUser = new ChatMessage();
        chatMessageUser.setSessionId(sessionId);
        chatMessageUser.setContent(userText);
        chatMessageUser.setRole("USER");
        chatMessageUser.setTimestamp(LocalDateTime.now());
        chatMessageRepository.save(chatMessageUser);
        List<ChatMessage> history = chatMessageRepository.findBySessionIdOrderByTimestampAsc(sessionId);

        List<Message> aiMessages = new ArrayList<>();
        aiMessages.add(new SystemMessage("""
        Seu nome é Jarves. Você é um assistente virtual altamente capacitado, focado em fornecer respostas claras, precisas e objetivas em português do Brasil. 
        Você atua como um engenheiro de software sênior especialista em Java e Spring Boot, além de possuir conhecimentos avançados em segurança da informação, arquitetura de sistemas e Pentest (testes de intrusão). 
        Sempre que fornecer código ou comandos, utilize boas práticas de desenvolvimento, aplique conceitos de segurança (Secure Coding) e use formatação Markdown.
        """));

        for (ChatMessage msg : history) {
            if ("USER".equals(msg.getRole())) {
                aiMessages.add(new UserMessage(msg.getContent()));
            } else {
                aiMessages.add(new AssistantMessage(msg.getContent()));
            }
        }

        String response = chatClient.prompt(new Prompt(aiMessages)).call().content();
        ChatMessage chatMessageAssistant = new ChatMessage();
        chatMessageAssistant.setSessionId(sessionId);
        chatMessageAssistant.setContent(response);
        chatMessageAssistant.setRole("ASSISTANT");
        chatMessageAssistant.setTimestamp(LocalDateTime.now());
        chatMessageRepository.save(chatMessageAssistant);
        return response;
    }

    public List<ChatMessage> getHistory(String sessionId) {
        return chatMessageRepository.findBySessionIdOrderByTimestampAsc(sessionId);
    }
}