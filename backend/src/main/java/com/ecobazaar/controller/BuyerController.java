package com.ecobazaar.controller;

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
@RequestMapping("/api/buyer")
@CrossOrigin(origins = "*")
public class BuyerController {

    @GetMapping("/dashboard")
    public ResponseEntity<Map<String, Object>> getBuyerDashboard() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();

        Map<String, Object> response = new HashMap<>();
        response.put("username", username);
        response.put("role", "BUYER");
        
        // Mock data for buyer dashboard
        response.put("totalPurchases", 15);
        response.put("carbonFootprint", "125.5");
        response.put("ecoScore", "8.5/10");
        
        List<String> recentPurchases = new ArrayList<>();
        recentPurchases.add("Organic Cotton T-Shirt - 2.3 kg CO2");
        recentPurchases.add("Reusable Water Bottle - 0.5 kg CO2");
        recentPurchases.add("LED Light Bulbs (Pack of 4) - 1.2 kg CO2");
        response.put("recentPurchases", recentPurchases);
        
        List<String> recommendations = new ArrayList<>();
        recommendations.add("Consider buying locally sourced products to reduce carbon footprint");
        recommendations.add("Your eco score improved by 15% this month!");
        recommendations.add("Try our eco-friendly product recommendations");
        response.put("recommendations", recommendations);

        return ResponseEntity.ok(response);
    }
}

