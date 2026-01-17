package com.ecobazaar.controller;

import com.ecobazaar.dto.CartItemDTO;
import com.ecobazaar.dto.ProductDTO;
import com.ecobazaar.entity.User;
import com.ecobazaar.repository.UserRepository;
import com.ecobazaar.service.CartService;
import com.ecobazaar.service.OrderService;
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
import java.util.Optional;

@RestController
@RequestMapping("/api/buyer")
@CrossOrigin(origins = "*")
@PreAuthorize("hasRole('BUYER') or hasRole('ADMIN')")
public class BuyerController {

    @Autowired
    private ProductService productService;

    @Autowired
    private CartService cartService;

    @Autowired
    private OrderService orderService;

    @Autowired
    private UserRepository userRepository;

    // ========================= DASHBOARD =========================

    @GetMapping("/dashboard")
    public ResponseEntity<Map<String, Object>> getBuyerDashboard() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();

        Map<String, Object> response = new HashMap<>();
        response.put("username", username);
        response.put("role", "BUYER");

        Optional<User> userOptional = userRepository.findByUsername(username);

        if (userOptional.isPresent()) {
            Long buyerId = userOptional.get().getId();
            response.put("userId", buyerId);

            List<com.ecobazaar.entity.Order> orders =
                    orderService.getOrdersByBuyer(buyerId);

            int totalPurchases = orders.size();

            double totalCarbon = orders.stream()
                    .filter(o -> o.getTotalCarbonFootprint() != null)
                    .mapToDouble(o -> o.getTotalCarbonFootprint().doubleValue())
                    .sum();

            response.put("totalPurchases", totalPurchases);
            response.put("carbonFootprint", String.format("%.1f", totalCarbon));
            response.put("recentOrders", orders.stream().limit(5).toList());
        } else {
            response.put("totalPurchases", 0);
            response.put("carbonFootprint", "0.0");
            response.put("recentOrders", List.of());
        }

        return ResponseEntity.ok(response);
    }

    // ========================= PRODUCTS =========================

    @GetMapping("/products")
    public ResponseEntity<List<ProductDTO>> getApprovedProducts() {
        List<ProductDTO> products = productService.getApprovedProducts();
        return ResponseEntity.ok(products);
    }

    @GetMapping("/products/{productId}")
    public ResponseEntity<ProductDTO> getProduct(@PathVariable Long productId) {
        try {
            ProductDTO product = productService.getProductById(productId);
            return ResponseEntity.ok(product);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    // ========================= CART =========================

    @PostMapping("/cart/add")
    public ResponseEntity<Map<String, Object>> addToCart(
            @RequestBody Map<String, Object> request) {

        try {
            Authentication authentication =
                    SecurityContextHolder.getContext().getAuthentication();
            String username = authentication.getName();

            Optional<User> userOptional = userRepository.findByUsername(username);
            if (userOptional.isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(Map.of("message", "User not found"));
            }

            Long buyerId = userOptional.get().getId();
            Long productId = Long.valueOf(request.get("productId").toString());
            Integer quantity = Integer.valueOf(request.get("quantity").toString());

            CartItemDTO cartItem =
                    cartService.addToCart(buyerId, productId, quantity);

            Map<String, Object> response = new HashMap<>();
            response.put("message", "Item added to cart");
            response.put("cartItem", cartItem);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping("/cart")
    public ResponseEntity<List<CartItemDTO>> getCart() {
        try {
            Authentication authentication =
                    SecurityContextHolder.getContext().getAuthentication();
            String username = authentication.getName();

            Optional<User> userOptional = userRepository.findByUsername(username);
            if (userOptional.isEmpty()) {
                return ResponseEntity.badRequest().build();
            }

            Long buyerId = userOptional.get().getId();
            List<CartItemDTO> cartItems =
                    cartService.getCartItems(buyerId);

            return ResponseEntity.ok(cartItems);

        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/cart/{cartItemId}")
    public ResponseEntity<Map<String, Object>> updateCartItem(
            @PathVariable Long cartItemId,
            @RequestBody Map<String, Object> request) {

        try {
            Authentication authentication =
                    SecurityContextHolder.getContext().getAuthentication();
            String username = authentication.getName();

            Optional<User> userOptional = userRepository.findByUsername(username);
            if (userOptional.isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(Map.of("message", "User not found"));
            }

            Long buyerId = userOptional.get().getId();
            Integer quantity =
                    Integer.valueOf(request.get("quantity").toString());

            CartItemDTO cartItem =
                    cartService.updateCartItem(buyerId, cartItemId, quantity);

            Map<String, Object> response = new HashMap<>();
            response.put("message", "Cart item updated");
            response.put("cartItem", cartItem);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", e.getMessage()));
        }
    }

    @DeleteMapping("/cart/{cartItemId}")
    public ResponseEntity<Map<String, Object>> removeFromCart(
            @PathVariable Long cartItemId) {

        try {
            Authentication authentication =
                    SecurityContextHolder.getContext().getAuthentication();
            String username = authentication.getName();

            Optional<User> userOptional = userRepository.findByUsername(username);
            if (userOptional.isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(Map.of("message", "User not found"));
            }

            Long buyerId = userOptional.get().getId();
            cartService.removeFromCart(buyerId, cartItemId);

            return ResponseEntity.ok(
                    Map.of("message", "Item removed from cart"));

        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", e.getMessage()));
        }
    }

    // ========================= CHECKOUT =========================

    @PostMapping("/cart/checkout")
    public ResponseEntity<Map<String, Object>> checkout() {
        try {
            Authentication authentication =
                    SecurityContextHolder.getContext().getAuthentication();
            String username = authentication.getName();

            Optional<User> userOptional = userRepository.findByUsername(username);
            if (userOptional.isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(Map.of("message", "User not found"));
            }

            Long buyerId = userOptional.get().getId();
            Map<String, Object> order =
                    orderService.checkout(buyerId);

            return ResponseEntity.ok(order);

        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", e.getMessage()));
        }
    }
}
