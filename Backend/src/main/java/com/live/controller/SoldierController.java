package com.live.controller;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import com.live.entity.Soldier;
import com.live.repository.SoldierRepository;
import com.live.service.SoldierService;

import java.util.List;

@RestController
@RequestMapping("/api/soldiers")
@CrossOrigin(origins = "*")
public class SoldierController {

    @Autowired
    private SoldierService soldierServ;

    @GetMapping
    public List<Soldier> getAll() {
        return soldierServ.getAllSoldier();
    }

    @PostMapping
    public Soldier create(@RequestBody Soldier soldier) {
        return soldierServ.createSoldier(soldier);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        soldierServ.deletesoldier(id);
    }
}