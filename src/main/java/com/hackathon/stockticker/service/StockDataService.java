package com.hackathon.stockticker.service;

import com.hackathon.stockticker.model.StockData;
import com.hackathon.stockticker.repository.StockDataRepository;
import com.opencsv.CSVReader;
import com.opencsv.exceptions.CsvException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.io.FileReader;
import java.io.IOException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class StockDataService {

    @Autowired
    private StockDataRepository stockDataRepository;

    @Value("${csv.file.path}")
    private String csvFilePath;

    private final DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    public void loadCsvData() {
        try (CSVReader reader = new CSVReader(new FileReader(csvFilePath))) {
            List<String[]> records = reader.readAll();
            
            if (!records.isEmpty()) {
                String[] headers = records.get(0);
                
                for (int i = 1; i < records.size(); i++) {
                    String[] row = records.get(i);
                    
                    LocalDateTime timestamp = LocalDateTime.parse(row[0], formatter);
                    Map<String, Double> stockPrices = new HashMap<>();
                    
                    for (int j = 1; j < headers.length && j < row.length; j++) {
                        try {
                            Double price = Double.parseDouble(row[j]);
                            stockPrices.put(headers[j], price);
                        } catch (NumberFormatException e) {
                            // Skip invalid price data
                        }
                    }
                    
                    StockData stockData = new StockData(timestamp, stockPrices);
                    stockDataRepository.save(stockData);
                }
            }
        } catch (IOException | CsvException e) {
            throw new RuntimeException("Error loading CSV data: " + e.getMessage());
        }
    }

    public List<StockData> getAllStockData() {
        return stockDataRepository.findAllOrderByTimestampDesc();
    }

    public Page<StockData> getStockDataPaginated(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("timestamp").descending());
        return stockDataRepository.findAll(pageable);
    }

    public StockData getStockDataById(Long id) {
        return stockDataRepository.findById(id).orElse(null);
    }

    public List<StockData> getStockDataByTimeRange(LocalDateTime startTime, LocalDateTime endTime) {
        return stockDataRepository.findByTimestampBetween(startTime, endTime);
    }

    public StockData getLatestStockData() {
        return stockDataRepository.findTopByOrderByTimestampDesc();
    }

    public long getTotalRecords() {
        return stockDataRepository.count();
    }
}
