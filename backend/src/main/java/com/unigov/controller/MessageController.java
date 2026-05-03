package com.unigov.controller;

import com.unigov.dto.MessageDtos.*;
import com.unigov.service.MessageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/messages")
public class MessageController {

    @Autowired
    private MessageService messageService;

    @PostMapping
    public ResponseEntity<MessageResponse> sendMessage(@RequestBody MessageRequest request, Principal principal) {
        return ResponseEntity.ok(messageService.sendMessage(request, principal.getName()));
    }

    @GetMapping("/conversations")
    public ResponseEntity<List<ConversationResponse>> getConversations(Principal principal) {
        return ResponseEntity.ok(messageService.getConversations(principal.getName()));
    }

    @GetMapping("/history/{userId}")
    public ResponseEntity<List<MessageResponse>> getConversation(@PathVariable String userId, Principal principal) {
        return ResponseEntity.ok(messageService.getConversation(userId, principal.getName()));
    }

    @GetMapping("/contacts")
    public ResponseEntity<List<ContactResponse>> getAvailableContacts(Principal principal) {
        return ResponseEntity.ok(messageService.getAvailableContacts(principal.getName()));
    }
}
