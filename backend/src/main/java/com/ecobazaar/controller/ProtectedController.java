package com.ecobazaar.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class ProtectedController {

    @GetMapping("/test")
    public ResponseEntity<Map<String, String>> test() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();

        Map<String, String> response = new HashMap<>();
        response.put("message", "This is a protected endpoint");
        response.put("username", username);
        response.put("status", "JWT token is valid");

        return ResponseEntity.ok(response);
    }

    @GetMapping("/user/profile")
    public ResponseEntity<Map<String, String>> getUserProfile() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();

        Map<String, String> response = new HashMap<>();
        response.put("message", "User profile endpoint");
        response.put("username", username);
        response.put("status", "authenticated");

        return ResponseEntity.ok(response);
    }
}

