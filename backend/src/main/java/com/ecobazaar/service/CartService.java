package com.ecobazaar.service;

import com.ecobazaar.dto.CartItemDTO;
import com.ecobazaar.entity.CartItem;
import com.ecobazaar.entity.Product;
import com.ecobazaar.repository.CartItemRepository;
import com.ecobazaar.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional
public class CartService {

    @Autowired
    private CartItemRepository cartItemRepository;

    @Autowired
    private ProductRepository productRepository;

    public CartItemDTO addToCart(Long buyerId, Long productId, Integer quantity) {
        // Check if product exists and is approved
        Product product = productRepository.findById(productId)
            .orElseThrow(() -> new RuntimeException("Product not found"));
        
        if (product.getStatus() != Product.Status.APPROVED) {
            throw new RuntimeException("Product is not available for purchase");
        }

        if (product.getQuantity() < quantity) {
            throw new RuntimeException("Insufficient stock. Available: " + product.getQuantity());
        }

        // Check if item already exists in cart
        Optional<CartItem> existingItem = cartItemRepository.findByBuyerIdAndProductId(buyerId, productId);
        
        CartItem cartItem;
        if (existingItem.isPresent()) {
            cartItem = existingItem.get();
            int newQuantity = cartItem.getQuantity() + quantity;
            if (product.getQuantity() < newQuantity) {
                throw new RuntimeException("Insufficient stock. Available: " + product.getQuantity());
            }
            cartItem.setQuantity(newQuantity);
        } else {
            cartItem = new CartItem(buyerId, productId, quantity);
        }

        cartItem = cartItemRepository.save(cartItem);
        return convertToDTO(cartItem, product);
    }

    public List<CartItemDTO> getCartItems(Long buyerId) {
        List<CartItem> cartItems = cartItemRepository.findByBuyerId(buyerId);
        return cartItems.stream()
            .map(item -> {
                Product product = productRepository.findById(item.getProductId())
                    .orElseThrow(() -> new RuntimeException("Product not found"));
                return convertToDTO(item, product);
            })
            .collect(Collectors.toList());
    }

    public CartItemDTO updateCartItem(Long buyerId, Long cartItemId, Integer quantity) {
        CartItem cartItem = cartItemRepository.findById(cartItemId)
            .orElseThrow(() -> new RuntimeException("Cart item not found"));

        if (!cartItem.getBuyerId().equals(buyerId)) {
            throw new RuntimeException("Unauthorized access to cart item");
        }

        Product product = productRepository.findById(cartItem.getProductId())
            .orElseThrow(() -> new RuntimeException("Product not found"));

        if (product.getQuantity() < quantity) {
            throw new RuntimeException("Insufficient stock. Available: " + product.getQuantity());
        }

        cartItem.setQuantity(quantity);
        cartItem = cartItemRepository.save(cartItem);
        return convertToDTO(cartItem, product);
    }

    public void removeFromCart(Long buyerId, Long cartItemId) {
        CartItem cartItem = cartItemRepository.findById(cartItemId)
            .orElseThrow(() -> new RuntimeException("Cart item not found"));

        if (!cartItem.getBuyerId().equals(buyerId)) {
            throw new RuntimeException("Unauthorized access to cart item");
        }

        cartItemRepository.delete(cartItem);
    }

    public void clearCart(Long buyerId) {
        cartItemRepository.deleteByBuyerId(buyerId);
    }

    private CartItemDTO convertToDTO(CartItem cartItem, Product product) {
        CartItemDTO dto = new CartItemDTO();
        dto.setId(cartItem.getId());
        dto.setProductId(cartItem.getProductId());
        dto.setProductName(product.getName());
        dto.setProductImageUrl(product.getImageUrl());
        dto.setProductPrice(product.getPrice());
        dto.setProductEcoRating(product.getEcoRating());
        dto.setProductCarbonFootprint(product.getCarbonFootprint());
        dto.setQuantity(cartItem.getQuantity());
        dto.setSubtotal(product.getPrice().multiply(BigDecimal.valueOf(cartItem.getQuantity())));
        if (product.getCarbonFootprint() != null) {
            dto.setCarbonFootprint(product.getCarbonFootprint().multiply(BigDecimal.valueOf(cartItem.getQuantity())));
        }
        return dto;
    }
}
