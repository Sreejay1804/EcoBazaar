package com.ecobazaar.controller;

import com.ecobazaar.dto.ProductDTO;
import com.ecobazaar.entity.User;
import com.ecobazaar.repository.UserRepository;
import com.ecobazaar.service.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "*")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProductService productService;

    @GetMapping("/dashboard")
    public ResponseEntity<Map<String, Object>> getAdminDashboard() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();

        Map<String, Object> response = new HashMap<>();
        response.put("username", username);
        response.put("role", "ADMIN");
        
        // Get real statistics from database
        long totalUsers = userRepository.count();
        long totalBuyers = userRepository.countByRole(User.Role.BUYER);
        long totalSellers = userRepository.countByRole(User.Role.SELLER);
        
        response.put("totalUsers", totalUsers);
        response.put("totalBuyers", totalBuyers);
        response.put("totalSellers", totalSellers);
        response.put("systemHealth", "Healthy");
        
        // Get recent users
        List<User> recentUsersList = userRepository.findTop5ByOrderByCreatedAtDesc();
        List<String> recentUsers = new java.util.ArrayList<>();
        for (User user : recentUsersList) {
            recentUsers.add(user.getUsername() + " (" + user.getRole() + ") - " + user.getEmail());
        }
        response.put("recentUsers", recentUsers);

        return ResponseEntity.ok(response);
    }

    @GetMapping("/products/pending")
    public ResponseEntity<List<ProductDTO>> getPendingProducts() {
        List<ProductDTO> products = productService.getPendingProducts();
        return ResponseEntity.ok(products);
    }

    @PostMapping("/products/{productId}/approve")
    public ResponseEntity<Map<String, Object>> approveProduct(@PathVariable Long productId) {
        try {
            ProductDTO product = productService.approveProduct(productId);
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Product approved successfully");
            response.put("product", product);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @PostMapping("/products/{productId}/reject")
    public ResponseEntity<Map<String, Object>> rejectProduct(@PathVariable Long productId) {
        try {
            ProductDTO product = productService.rejectProduct(productId);
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Product rejected");
            response.put("product", product);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
}

