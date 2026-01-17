package com.ecobazaar.service;

import com.ecobazaar.entity.CartItem;
import com.ecobazaar.entity.Order;
import com.ecobazaar.entity.OrderItem;
import com.ecobazaar.entity.Product;
import com.ecobazaar.repository.CartItemRepository;
import com.ecobazaar.repository.OrderItemRepository;
import com.ecobazaar.repository.OrderRepository;
import com.ecobazaar.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@Transactional
public class OrderService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private OrderItemRepository orderItemRepository;

    @Autowired
    private CartItemRepository cartItemRepository;

    @Autowired
    private ProductRepository productRepository;

    public Map<String, Object> checkout(Long buyerId) {
        List<CartItem> cartItems = cartItemRepository.findByBuyerId(buyerId);
        
        if (cartItems.isEmpty()) {
            throw new RuntimeException("Cart is empty");
        }

        BigDecimal totalAmount = BigDecimal.ZERO;
        BigDecimal totalCarbonFootprint = BigDecimal.ZERO;

        // Validate stock and calculate totals
        for (CartItem cartItem : cartItems) {
            Product product = productRepository.findById(cartItem.getProductId())
                .orElseThrow(() -> new RuntimeException("Product not found: " + cartItem.getProductId()));

            if (product.getStatus() != Product.Status.APPROVED) {
                throw new RuntimeException("Product " + product.getName() + " is no longer available");
            }

            if (product.getQuantity() < cartItem.getQuantity()) {
                throw new RuntimeException("Insufficient stock for " + product.getName() + ". Available: " + product.getQuantity());
            }

            BigDecimal itemTotal = product.getPrice().multiply(BigDecimal.valueOf(cartItem.getQuantity()));
            totalAmount = totalAmount.add(itemTotal);

            if (product.getCarbonFootprint() != null) {
                BigDecimal itemCarbon = product.getCarbonFootprint().multiply(BigDecimal.valueOf(cartItem.getQuantity()));
                totalCarbonFootprint = totalCarbonFootprint.add(itemCarbon);
            }
        }

        // Create order
        Order order = new Order(buyerId, totalAmount, totalCarbonFootprint);
        order = orderRepository.save(order);

        // Create order items and update product quantities
        for (CartItem cartItem : cartItems) {
            Product product = productRepository.findById(cartItem.getProductId()).get();
            
            OrderItem orderItem = new OrderItem();
            orderItem.setOrderId(order.getId());
            orderItem.setProductId(cartItem.getProductId());
            orderItem.setQuantity(cartItem.getQuantity());
            orderItem.setPrice(product.getPrice());
            orderItem.setCarbonFootprint(product.getCarbonFootprint() != null ? 
                product.getCarbonFootprint().multiply(BigDecimal.valueOf(cartItem.getQuantity())) : null);
            orderItemRepository.save(orderItem);

            // Update product quantity
            product.setQuantity(product.getQuantity() - cartItem.getQuantity());
            productRepository.save(product);
        }

        // Clear cart
        cartItemRepository.deleteByBuyerId(buyerId);

        Map<String, Object> response = new HashMap<>();
        response.put("orderId", order.getId());
        response.put("totalAmount", totalAmount);
        response.put("totalCarbonFootprint", totalCarbonFootprint);
        response.put("status", order.getStatus().name());
        response.put("message", "Order placed successfully");

        return response;
    }

    public List<Order> getOrdersByBuyer(Long buyerId) {
        return orderRepository.findByBuyerIdOrderByCreatedAtDesc(buyerId);
    }
}
