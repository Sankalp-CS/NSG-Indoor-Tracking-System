package com.live.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import com.live.entity.Alert;
import com.live.entity.RedZone;
import com.live.repository.BuildingRepository;
import com.live.repository.RedZoneRepository;
import com.live.service.AlertService;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/alerts")
@CrossOrigin(origins = "*")
public class AlertController {

    @Autowired
    private AlertService alertService;

    @Autowired
    private RedZoneRepository redZoneRepository;

    @Autowired
    private BuildingRepository buildingRepository;

    @GetMapping("/active")
    public List<Alert> getActive() {
        return alertService.getActiveAlerts();
    }

    @PostMapping("/{alertId}/message")
    public Alert sendMessage(
            @PathVariable Long alertId,
            @RequestBody Map<String, String> body) {
        return alertService.sendCommanderMessage(alertId, body.get("message"));
    }

    @PostMapping("/redzone")
    public RedZone createRedZone(@RequestBody RedZoneRequest request) {
        RedZone zone = new RedZone();
        zone.setZoneName(request.getZoneName());
        zone.setFloorNo(request.getFloorNumber());
        zone.setMinX(request.getMinX());
        zone.setMaxX(request.getMaxX());
        zone.setMinZ(request.getMinZ());
        zone.setMaxZ(request.getMaxZ());
        zone.setBuilding(buildingRepository.findById(request.getBuildingId())
                .orElseThrow(() -> new RuntimeException("Building not found")));
        return redZoneRepository.save(zone);
    }

    @GetMapping("/redzone")
    public List<RedZone> getAllRedZones() {
        return redZoneRepository.findAll();
    }

    @DeleteMapping("/redzone/{id}")
    public void deleteRedZone(@PathVariable Long id) {
        redZoneRepository.deleteById(id);
    }
}
