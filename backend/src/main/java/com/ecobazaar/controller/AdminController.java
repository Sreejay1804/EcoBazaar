package com.ecobazaar.controller;

import com.ecobazaar.entity.User;
import com.ecobazaar.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "*")
public class AdminController {

    @Autowired
    private UserRepository userRepository;

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
        response.put("totalProducts", 1250); // Mock data
        response.put("totalOrders", 3420); // Mock data
        response.put("systemHealth", "Healthy");
        
        // Get recent users
        List<User> recentUsersList = userRepository.findTop5ByOrderByCreatedAtDesc();
        List<String> recentUsers = new ArrayList<>();
        for (User user : recentUsersList) {
            recentUsers.add(user.getUsername() + " (" + user.getRole() + ") - " + user.getEmail());
        }
        response.put("recentUsers", recentUsers);
        
        List<String> analytics = new ArrayList<>();
        analytics.add("Daily Active Users: 1,234");
        analytics.add("Monthly Revenue: $45,678");
        analytics.add("Average Carbon Footprint Reduction: 23%");
        analytics.add("Top Selling Category: Eco-Friendly Products");
        response.put("analytics", analytics);

        return ResponseEntity.ok(response);
    }
}

