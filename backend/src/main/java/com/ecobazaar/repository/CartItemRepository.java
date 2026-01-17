package com.ecobazaar.repository;

import com.ecobazaar.entity.CartItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CartItemRepository extends JpaRepository<CartItem, Long> {
    List<CartItem> findByBuyerId(Long buyerId);
    Optional<CartItem> findByBuyerIdAndProductId(Long buyerId, Long productId);
    void deleteByBuyerId(Long buyerId);
    long countByBuyerId(Long buyerId);
}
