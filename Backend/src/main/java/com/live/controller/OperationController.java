package com.live.controller;

import com.live.entity.Operation;
import com.live.repository.BuildingRepository;
import com.live.repository.OperationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/operations")
@CrossOrigin(origins = "*")
public class OperationController {

    @Autowired
    private OperationRepository operationRepository;

    @Autowired
    private BuildingRepository buildingRepository;

    // Get all operations
    @GetMapping
    public List<Operation> getAll() {
        return operationRepository.findAll();
    }

    // Get active operations
    @GetMapping("/active")
    public List<Operation> getActive() {
        return operationRepository.findByStatus("ACTIVE");
    }

    // Create a new operation (ICP starts an op)
    @PostMapping
    public Operation create(@RequestBody Map<String, Object> body) {
        Operation op = new Operation();
        Long buildingId = Long.valueOf(body.get("buildingId").toString());
        op.setBuilding(buildingRepository.findById(buildingId)
                .orElseThrow(() -> new RuntimeException("Building not found")));
        op.setCommanderName(body.get("commanderName").toString());
        op.setStartTime(LocalDateTime.now());
        op.setStatus("ACTIVE");
        return operationRepository.save(op);
    }

    // End/update operation status
    @PatchMapping("/{id}/status")
    public Operation updateStatus(@PathVariable Long id, @RequestBody Map<String, String> body) {
        Operation op = operationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Operation not found"));
        op.setStatus(body.get("status"));
        return operationRepository.save(op);
    }

    // Delete an operation
    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        operationRepository.deleteById(id);
    }
}
