package com.live.controller;

import com.live.entity.Building;
import com.live.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/buildings")
@CrossOrigin(origins = "*")
public class BuildingController {

    @Autowired
    private BuildingRepository buildingRepository;

    @GetMapping
    public List<Building> getAll() {
        return buildingRepository.findAll();
    }

    @PostMapping
    public Building create(@RequestBody Building building) {
        return buildingRepository.save(building);
    }
}