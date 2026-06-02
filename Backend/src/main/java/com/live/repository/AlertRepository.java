package com.live.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.live.entity.Alert;

import jakarta.transaction.Transactional;

@Repository
public interface AlertRepository extends JpaRepository<Alert, Long> {
    List<Alert> findByStatus(String status);
    List<Alert> findBySoldierId(Long soldierId);
    boolean existsBySoldierIdAndRedZoneIdAndStatus(Long soldierId, Long redZoneId, String status);
    
    @Transactional
    void deleteBySoldierId(Long soldierId);
    
    @Transactional
    void deleteByRedZoneId(Long redZoneId);
}
