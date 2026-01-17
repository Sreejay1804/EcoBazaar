package com.ecobazaar.dto;

import jakarta.validation.constraints.*;
import java.math.BigDecimal;

public class CreateProductRequest {
    @NotBlank(message = "Product name is required")
    @Size(min = 1, max = 200)
    private String name;

    @Size(max = 1000)
    private String description;

    @NotNull(message = "Price is required")
    @DecimalMin(value = "0.01", message = "Price must be greater than 0")
    private BigDecimal price;

    private String imageUrl;

    @NotNull(message = "Quantity is required")
    @Min(value = 0, message = "Quantity cannot be negative")
    private Integer quantity;

    @NotNull(message = "Eco rating is required")
    @DecimalMin(value = "0.0", message = "Eco rating must be at least 0")
    @DecimalMax(value = "10.0", message = "Eco rating must be at most 10")
    private BigDecimal ecoRating;

    private BigDecimal carbonFootprint;

    // Getters and Setters
    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public BigDecimal getPrice() {
        return price;
    }

    public void setPrice(BigDecimal price) {
        this.price = price;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }

    public BigDecimal getEcoRating() {
        return ecoRating;
    }

    public void setEcoRating(BigDecimal ecoRating) {
        this.ecoRating = ecoRating;
    }

    public BigDecimal getCarbonFootprint() {
        return carbonFootprint;
    }

    public void setCarbonFootprint(BigDecimal carbonFootprint) {
        this.carbonFootprint = carbonFootprint;
    }
}
