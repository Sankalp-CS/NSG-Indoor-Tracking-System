package com.live.service;


import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.live.entity.Location;
import com.live.entity.Soldier;
import com.live.repository.LocationRepository;
import com.live.repository.SoldierRepository;

@Service
public class LocationService {
	
	
	@Autowired
	private AlertService alertService;

    @Autowired
    private LocationRepository locationRepository;

    @Autowired
    private SoldierRepository soldierRepository;

    public Location saveLocation(Location location) {
        Location saved = locationRepository.save(location);
        
        alertService.checkRedZones(saved);
        return saved;
    }

    public Location getLatestLocation(Long soldierId) {
        Optional<Soldier> soldier = soldierRepository.findById(soldierId);
        return soldier.map(locationRepository::findTopBySoldierOrderByTimestampDesc)
                      .orElse(null);
    }

    public List<Location> getLocationHistory(Long soldierId) {
        Optional<Soldier> soldier = soldierRepository.findById(soldierId);
        return soldier.map(locationRepository::findBySoldierOrderByTimestampDesc)
                      .orElse(List.of());
    }

    public List<Location> getAllLatestLocations() {
        List<Soldier> soldiers = soldierRepository.findAll();
        return soldiers.stream()
                .map(locationRepository::findTopBySoldierOrderByTimestampDesc)
                .filter(loc -> loc != null)
                .toList();
    }
}