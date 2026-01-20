package com.ecobazaar.service;

import com.ecobazaar.dto.CreateProductRequest;
import com.ecobazaar.dto.ProductDTO;
import com.ecobazaar.entity.Product;
import com.ecobazaar.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class ProductService {

    @Autowired
    private ProductRepository productRepository;

    private static final DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    public ProductDTO createProduct(CreateProductRequest request, Long sellerId) {
        Product product = new Product();
        product.setName(request.getName());
        product.setDescription(request.getDescription());
        product.setPrice(request.getPrice());
        product.setImageUrl(request.getImageUrl());
        product.setQuantity(request.getQuantity());
        product.setEcoRating(request.getEcoRating());
        product.setSellerId(sellerId);
        product.setStatus(Product.Status.PENDING);

        // Set carbon footprint if provided, otherwise calculate based on eco rating
        if (request.getCarbonFootprint() != null) {
            product.setCarbonFootprint(request.getCarbonFootprint());
        } else {
            // Simple calculation: higher eco rating = lower carbon footprint
            // Eco rating 10 = 0.1 kg, eco rating 0 = 15 kg
            BigDecimal carbonFootprint = BigDecimal.valueOf(15.0)
                .subtract(request.getEcoRating().multiply(BigDecimal.valueOf(1.49)));
            if (carbonFootprint.compareTo(BigDecimal.ZERO) < 0) {
                carbonFootprint = BigDecimal.valueOf(0.1);
            }
            product.setCarbonFootprint(carbonFootprint);
        }

        product = productRepository.save(product);
        return convertToDTO(product);
    }

    public List<ProductDTO> getProductsBySeller(Long sellerId) {
        return productRepository.findBySellerId(sellerId)
            .stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());
    }

    public List<ProductDTO> getPendingProducts() {
        return productRepository.findByStatusOrderByCreatedAtDesc(Product.Status.PENDING)
            .stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());
    }

    public List<ProductDTO> getApprovedProducts() {
        return productRepository.findByStatus(Product.Status.APPROVED)
            .stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());
    }

    public ProductDTO approveProduct(Long productId) {
        Product product = productRepository.findById(productId)
            .orElseThrow(() -> new RuntimeException("Product not found"));
        product.setStatus(Product.Status.APPROVED);
        product = productRepository.save(product);
        return convertToDTO(product);
    }

    public ProductDTO rejectProduct(Long productId) {
        Product product = productRepository.findById(productId)
            .orElseThrow(() -> new RuntimeException("Product not found"));
        product.setStatus(Product.Status.REJECTED);
        product = productRepository.save(product);
        return convertToDTO(product);
    }

    public ProductDTO getProductById(Long productId) {
        Product product = productRepository.findById(productId)
            .orElseThrow(() -> new RuntimeException("Product not found"));
        return convertToDTO(product);
    }

    public Product getProductEntity(Long productId) {
        return productRepository.findById(productId)
            .orElseThrow(() -> new RuntimeException("Product not found"));
    }

    public void deleteProduct(Long productId) {
        if (!productRepository.existsById(productId)) {
            throw new RuntimeException("Product not found");
        }
        productRepository.deleteById(productId);
    }

    public List<ProductDTO> getAllProducts() {
        return productRepository.findAll()
            .stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());
    }

    private ProductDTO convertToDTO(Product product) {
        ProductDTO dto = new ProductDTO();
        dto.setId(product.getId());
        dto.setName(product.getName());
        dto.setDescription(product.getDescription());
        dto.setPrice(product.getPrice());
        dto.setImageUrl(product.getImageUrl());
        dto.setQuantity(product.getQuantity());
        dto.setEcoRating(product.getEcoRating());
        dto.setStatus(product.getStatus().name());
        dto.setSellerId(product.getSellerId());
        dto.setCarbonFootprint(product.getCarbonFootprint());
        if (product.getCreatedAt() != null) {
            dto.setCreatedAt(product.getCreatedAt().format(formatter));
        }
        if (product.getUpdatedAt() != null) {
            dto.setUpdatedAt(product.getUpdatedAt().format(formatter));
        }
        return dto;
    }
}
