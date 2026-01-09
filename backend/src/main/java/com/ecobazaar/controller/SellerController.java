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
@RequestMapping("/api/seller")
@CrossOrigin(origins = "*")
public class SellerController {

    @GetMapping("/dashboard")
    public ResponseEntity<Map<String, Object>> getSellerDashboard() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();

        Map<String, Object> response = new HashMap<>();
        response.put("username", username);
        response.put("role", "SELLER");
        
        // Mock data for seller dashboard
        response.put("totalProducts", 42);
        response.put("totalSales", 128);
        response.put("revenue", "12,450.00");
        response.put("avgCarbonRating", "7.8/10");
        
        List<String> products = new ArrayList<>();
        products.add("Eco-Friendly Bamboo Toothbrush - 4.5★");
        products.add("Organic Cotton Tote Bag - 4.8★");
        products.add("Solar-Powered Charger - 4.2★");
        response.put("products", products);
        
        List<String> recentOrders = new ArrayList<>();
        recentOrders.add("Order #1234 - $89.99 - 2.3 kg CO2");
        recentOrders.add("Order #1235 - $45.50 - 1.1 kg CO2");
        recentOrders.add("Order #1236 - $156.00 - 3.5 kg CO2");
        response.put("recentOrders", recentOrders);

        return ResponseEntity.ok(response);
    }
}

