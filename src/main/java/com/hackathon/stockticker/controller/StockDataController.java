package com.hackathon.stockticker.controller;

import com.hackathon.stockticker.dto.ApiResponse;
import com.hackathon.stockticker.model.StockData;
import com.hackathon.stockticker.service.StockDataService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/stock-data")
@SecurityRequirement(name = "Bearer Authentication")
@Tag(name = "Stock Data", description = "Stock market data management APIs")
public class StockDataController {

    @Autowired
    private StockDataService stockDataService;

    @GetMapping("/all")
    @Operation(summary = "Get all stock data", description = "Retrieve all stock market data records")
    public ResponseEntity<ApiResponse<List<StockData>>> getAllStockData() {
        try {
            List<StockData> stockData = stockDataService.getAllStockData();
            return ResponseEntity.ok(ApiResponse.success("Stock data retrieved successfully", stockData));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Failed to retrieve stock data: " + e.getMessage()));
        }
    }

    @GetMapping("/paginated")
    @Operation(summary = "Get paginated stock data", description = "Retrieve stock market data with pagination")
    public ResponseEntity<ApiResponse<Page<StockData>>> getStockDataPaginated(
            @Parameter(description = "Page number (0-based)") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size") @RequestParam(defaultValue = "10") int size) {
        try {
            Page<StockData> stockData = stockDataService.getStockDataPaginated(page, size);
            return ResponseEntity.ok(ApiResponse.success("Paginated stock data retrieved successfully", stockData));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Failed to retrieve paginated stock data: " + e.getMessage()));
        }
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get stock data by ID", description = "Retrieve a specific stock data record by ID")
    public ResponseEntity<ApiResponse<StockData>> getStockDataById(
            @Parameter(description = "Stock data ID") @PathVariable Long id) {
        try {
            StockData stockData = stockDataService.getStockDataById(id);
            if (stockData != null) {
                return ResponseEntity.ok(ApiResponse.success("Stock data retrieved successfully", stockData));
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Failed to retrieve stock data: " + e.getMessage()));
        }
    }

    @GetMapping("/latest")
    @Operation(summary = "Get latest stock data", description = "Retrieve the most recent stock market data")
    public ResponseEntity<ApiResponse<StockData>> getLatestStockData() {
        try {
            StockData stockData = stockDataService.getLatestStockData();
            if (stockData != null) {
                return ResponseEntity.ok(ApiResponse.success("Latest stock data retrieved successfully", stockData));
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Failed to retrieve latest stock data: " + e.getMessage()));
        }
    }

    @GetMapping("/range")
    @Operation(summary = "Get stock data by time range", description = "Retrieve stock market data within a specific time range")
    public ResponseEntity<ApiResponse<List<StockData>>> getStockDataByTimeRange(
            @Parameter(description = "Start time (format: yyyy-MM-ddTHH:mm:ss)") 
            @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss") LocalDateTime startTime,
            @Parameter(description = "End time (format: yyyy-MM-ddTHH:mm:ss)") 
            @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss") LocalDateTime endTime) {
        try {
            List<StockData> stockData = stockDataService.getStockDataByTimeRange(startTime, endTime);
            return ResponseEntity.ok(ApiResponse.success("Stock data in range retrieved successfully", stockData));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Failed to retrieve stock data by range: " + e.getMessage()));
        }
    }

    @GetMapping("/count")
    @Operation(summary = "Get total record count", description = "Get the total number of stock data records")
    public ResponseEntity<ApiResponse<Long>> getTotalRecords() {
        try {
            long count = stockDataService.getTotalRecords();
            return ResponseEntity.ok(ApiResponse.success("Total record count retrieved successfully", count));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Failed to retrieve total count: " + e.getMessage()));
        }
    }

    @PostMapping("/load-csv")
    @Operation(summary = "Load CSV data", description = "Load stock data from CSV file into database")
    public ResponseEntity<ApiResponse<String>> loadCsvData() {
        try {
            stockDataService.loadCsvData();
            return ResponseEntity.ok(ApiResponse.success("CSV data loaded successfully", "Data import completed"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Failed to load CSV data: " + e.getMessage()));
        }
    }
}
