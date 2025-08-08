package com.hackathon.stockticker.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.Map;

@Entity
@Table(name = "stock_data")
public class StockData {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "timestamp")
    private LocalDateTime timestamp;
    
    @ElementCollection
    @CollectionTable(name = "stock_prices", joinColumns = @JoinColumn(name = "stock_data_id"))
    @MapKeyColumn(name = "symbol")
    @Column(name = "price")
    private Map<String, Double> stockPrices;
    
    public StockData() {}
    
    public StockData(LocalDateTime timestamp, Map<String, Double> stockPrices) {
        this.timestamp = timestamp;
        this.stockPrices = stockPrices;
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public LocalDateTime getTimestamp() {
        return timestamp;
    }
    
    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }
    
    public Map<String, Double> getStockPrices() {
        return stockPrices;
    }
    
    public void setStockPrices(Map<String, Double> stockPrices) {
        this.stockPrices = stockPrices;
    }
}
