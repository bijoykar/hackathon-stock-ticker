package com.hackathon.stockticker.repository;

import com.hackathon.stockticker.model.StockData;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface StockDataRepository extends JpaRepository<StockData, Long> {
    
    @Query("SELECT s FROM StockData s WHERE s.timestamp BETWEEN :startTime AND :endTime ORDER BY s.timestamp")
    List<StockData> findByTimestampBetween(@Param("startTime") LocalDateTime startTime, 
                                          @Param("endTime") LocalDateTime endTime);
    
    @Query("SELECT s FROM StockData s ORDER BY s.timestamp DESC")
    List<StockData> findAllOrderByTimestampDesc();
    
    StockData findTopByOrderByTimestampDesc();
}
