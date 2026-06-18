package com.mono.monoapi.controller;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.boot.autoconfigure.AutoConfigureOrder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.beans.factory.annotation.Autowired;
import com.mono.monoapi.service.MonoService;

@RestController
@RequestMapping("/api")
public class MonoController {

    @Autowired
    public MonoService monoService;

   
    @PostMapping("/chat")
    public String chat(@RequestBody String message) {
        return monoService.chat(message);
    }
}
