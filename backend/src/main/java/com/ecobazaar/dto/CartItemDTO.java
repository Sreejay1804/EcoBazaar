package com.ecobazaar.dto;

import java.math.BigDecimal;

public class CartItemDTO {
    private Long id;
    private Long productId;
    private String productName;
    private String productImageUrl;
    private BigDecimal productPrice;
    private BigDecimal productEcoRating;
    private BigDecimal productCarbonFootprint;
    private Integer quantity;
    private BigDecimal subtotal;
    private BigDecimal carbonFootprint;

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getProductId() {
        return productId;
    }

    public void setProductId(Long productId) {
        this.productId = productId;
    }

    public String getProductName() {
        return productName;
    }

    public void setProductName(String productName) {
        this.productName = productName;
    }

    public String getProductImageUrl() {
        return productImageUrl;
    }

    public void setProductImageUrl(String productImageUrl) {
        this.productImageUrl = productImageUrl;
    }

    public BigDecimal getProductPrice() {
        return productPrice;
    }

    public void setProductPrice(BigDecimal productPrice) {
        this.productPrice = productPrice;
    }

    public BigDecimal getProductEcoRating() {
        return productEcoRating;
    }

    public void setProductEcoRating(BigDecimal productEcoRating) {
        this.productEcoRating = productEcoRating;
    }

    public BigDecimal getProductCarbonFootprint() {
        return productCarbonFootprint;
    }

    public void setProductCarbonFootprint(BigDecimal productCarbonFootprint) {
        this.productCarbonFootprint = productCarbonFootprint;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }

    public BigDecimal getSubtotal() {
        return subtotal;
    }

    public void setSubtotal(BigDecimal subtotal) {
        this.subtotal = subtotal;
    }

    public BigDecimal getCarbonFootprint() {
        return carbonFootprint;
    }

    public void setCarbonFootprint(BigDecimal carbonFootprint) {
        this.carbonFootprint = carbonFootprint;
    }
}
