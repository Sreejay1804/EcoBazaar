package com.ecobazaar.controller;

import com.ecobazaar.dto.CreateProductRequest;
import com.ecobazaar.dto.ProductDTO;
import com.ecobazaar.entity.User;
import com.ecobazaar.repository.UserRepository;
import com.ecobazaar.service.ProductService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/seller")
@CrossOrigin(origins = "*")
@PreAuthorize("hasRole('SELLER') or hasRole('ADMIN')")
public class SellerController {

    @Autowired
    private ProductService productService;

    @Autowired
    private UserRepository userRepository;

    @GetMapping("/dashboard")
    public ResponseEntity<Map<String, Object>> getSellerDashboard() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        
        Optional<User> userOptional = userRepository.findByUsername(username);
        if (userOptional.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        Long sellerId = userOptional.get().getId();

        Map<String, Object> response = new HashMap<>();
        response.put("username", username);
        response.put("role", "SELLER");
        
        List<ProductDTO> products = productService.getProductsBySeller(sellerId);
        long totalProducts = products.size();
        long approvedProducts = products.stream().filter(p -> "APPROVED".equals(p.getStatus())).count();
        long pendingProducts = products.stream().filter(p -> "PENDING".equals(p.getStatus())).count();
        
        response.put("totalProducts", totalProducts);
        response.put("approvedProducts", approvedProducts);
        response.put("pendingProducts", pendingProducts);
        response.put("products", products);

        return ResponseEntity.ok(response);
    }

    @PostMapping("/products")
    public ResponseEntity<Map<String, Object>> createProduct(@Valid @RequestBody CreateProductRequest request) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String username = authentication.getName();
            
            Optional<User> userOptional = userRepository.findByUsername(username);
            if (userOptional.isEmpty()) {
                Map<String, Object> error = new HashMap<>();
                error.put("message", "User not found");
                return ResponseEntity.badRequest().body(error);
            }
            Long sellerId = userOptional.get().getId();

            ProductDTO product = productService.createProduct(request, sellerId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Product created successfully and submitted for approval");
            response.put("product", product);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @GetMapping("/products")
    public ResponseEntity<List<ProductDTO>> getMyProducts() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        
        Optional<User> userOptional = userRepository.findByUsername(username);
        if (userOptional.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        Long sellerId = userOptional.get().getId();

        List<ProductDTO> products = productService.getProductsBySeller(sellerId);
        return ResponseEntity.ok(products);
    }

    @DeleteMapping("/products/{productId}")
    public ResponseEntity<Map<String, Object>> deleteProduct(@PathVariable Long productId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        Optional<User> userOptional = userRepository.findByUsername(username);
        if (userOptional.isEmpty()) {
            Map<String, Object> error = new HashMap<>();
            error.put("message", "Seller not found");
            return ResponseEntity.badRequest().body(error);
        }
        Long sellerId = userOptional.get().getId();
        try {
            var product = productService.getProductEntity(productId);
            if (!product.getSellerId().equals(sellerId)) {
                Map<String, Object> error = new HashMap<>();
                error.put("message", "You can only delete your own products");
                return ResponseEntity.status(403).body(error);
            }
            productService.deleteProduct(productId);
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Product deleted successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
}
