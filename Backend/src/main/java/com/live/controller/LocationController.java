package com.live.controller;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;

import com.live.entity.Building;
import com.live.entity.Location;
import com.live.entity.Soldier;
import com.live.repository.BuildingRepository;
import com.live.repository.SoldierRepository;
import com.live.service.LocationService;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/location")
@CrossOrigin(origins = "*")
public class LocationController {

    @Autowired
    private LocationService locationService;

    @Autowired
    private SoldierRepository soldierRepository;

    @Autowired
    private BuildingRepository buildingRepository;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    // POST — receive location update, save it, broadcast via WebSocket
    @PostMapping("/update")
    public Location updateLocation(@RequestBody LocationUpdateRequest request) {

        Soldier soldier = soldierRepository.findById(request.getSoldierId())
                .orElseThrow(() -> new RuntimeException("Soldier not found"));

        Building building = buildingRepository.findById(request.getBuildingId())
                .orElseThrow(() -> new RuntimeException("Building not found"));

        Location location = new Location();
        location.setSoldier(soldier);
        location.setBuilding(building);
        location.setX(request.getX());
        location.setY(request.getY());
        location.setZ(request.getZ());
        location.setFloorNumber(request.getFloorNumber());
        location.setTimestamp(LocalDateTime.now());

        Location saved = locationService.saveLocation(location);

        messagingTemplate.convertAndSend("/topic/locations", saved);

        return saved;
    }

    @GetMapping("/latest/{soldierId}")
    public Location getLatest(@PathVariable Long soldierId) {
        return locationService.getLatestLocation(soldierId);
    }

    @GetMapping("/history/{soldierId}")
    public List<Location> getHistory(@PathVariable Long soldierId) {
        return locationService.getLocationHistory(soldierId);
    }

    @GetMapping("/all")
    public List<Location> getAllLatest() {
        return locationService.getAllLatestLocations();
    }
}