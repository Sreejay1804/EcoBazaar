package com.ecobazaar.repository;

import com.ecobazaar.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    List<Product> findBySellerId(Long sellerId);
    List<Product> findByStatus(Product.Status status);
    List<Product> findByStatusOrderByCreatedAtDesc(Product.Status status);
    List<Product> findByStatusAndSellerId(Product.Status status, Long sellerId);
}
