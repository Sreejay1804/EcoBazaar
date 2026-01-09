package com.ecobazaar.controller;

import com.ecobazaar.dto.UserProfileDTO;
import com.ecobazaar.entity.User;
import com.ecobazaar.repository.UserRepository;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/profile")
@CrossOrigin(origins = "*")
public class ProfileController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @GetMapping
    public ResponseEntity<Map<String, Object>> getProfile() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();

        Optional<User> userOptional = userRepository.findByUsername(username);
        if (userOptional.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        User user = userOptional.get();
        Map<String, Object> response = new HashMap<>();
        response.put("id", user.getId());
        response.put("username", user.getUsername());
        response.put("email", user.getEmail());
        response.put("role", user.getRole().name());
        response.put("createdAt", user.getCreatedAt());
        response.put("updatedAt", user.getUpdatedAt());
        
        // Additional profile fields (can be extended)
        response.put("firstName", null);
        response.put("lastName", null);
        response.put("phoneNumber", null);
        response.put("address", null);
        response.put("city", null);
        response.put("country", null);
        response.put("bio", null);
        response.put("preferences", null);

        return ResponseEntity.ok(response);
    }

    @PutMapping
    public ResponseEntity<?> updateProfile(@Valid @RequestBody UserProfileDTO profileDTO) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();

        Optional<User> userOptional = userRepository.findByUsername(username);
        if (userOptional.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        User user = userOptional.get();

        // Check if email is being changed and if it's already taken by another user
        if (profileDTO.getEmail() != null && !profileDTO.getEmail().equals(user.getEmail())) {
            if (userRepository.existsByEmail(profileDTO.getEmail())) {
                return ResponseEntity.badRequest()
                        .body(Map.of("message", "Email is already in use by another account"));
            }
            user.setEmail(profileDTO.getEmail());
        }

        // Update password if provided
        if (profileDTO.getPassword() != null && !profileDTO.getPassword().isEmpty()) {
            user.setPassword(passwordEncoder.encode(profileDTO.getPassword()));
        }

        // Update additional fields (extend User entity if needed)
        // For now, we'll just update email and password
        // You can extend User entity to include firstName, lastName, etc.

        user = userRepository.save(user);

        Map<String, Object> response = new HashMap<>();
        response.put("message", "Profile updated successfully");
        response.put("username", user.getUsername());
        response.put("email", user.getEmail());
        response.put("role", user.getRole().name());
        response.put("updatedAt", user.getUpdatedAt());

        return ResponseEntity.ok(response);
    }

    @DeleteMapping
    public ResponseEntity<?> deleteProfile() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();

        Optional<User> userOptional = userRepository.findByUsername(username);
        if (userOptional.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        userRepository.delete(userOptional.get());

        return ResponseEntity.ok(Map.of("message", "Account deleted successfully"));
    }
}

