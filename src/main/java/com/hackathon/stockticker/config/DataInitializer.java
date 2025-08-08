package com.hackathon.stockticker.config;

import com.hackathon.stockticker.service.StockDataService;
import com.hackathon.stockticker.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private UserService userService;

    @Autowired
    private StockDataService stockDataService;

    @Override
    public void run(String... args) throws Exception {
        // Create default admin user
        if (!userService.existsByUsername("admin")) {
            userService.createUser("admin", "admin123");
            System.out.println("Default admin user created - Username: admin, Password: admin123");
        }

        // Create default test user
        if (!userService.existsByUsername("user")) {
            userService.createUser("user", "user123");
            System.out.println("Default test user created - Username: user, Password: user123");
        }

        // Load CSV data if database is empty
        if (stockDataService.getTotalRecords() == 0) {
            System.out.println("Loading CSV data...");
            stockDataService.loadCsvData();
            System.out.println("CSV data loaded successfully. Total records: " + stockDataService.getTotalRecords());
        }
    }
}
