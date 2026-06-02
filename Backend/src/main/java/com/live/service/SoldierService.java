package com.live.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.live.entity.Soldier;
import com.live.repository.AlertRepository;
import com.live.repository.LocationRepository;
import com.live.repository.SoldierRepository;
@Service
public class SoldierService {
	
	@Autowired
	SoldierRepository soldierRepo;
	
	@Autowired
	LocationRepository locationRepo;
	
	@Autowired
	AlertRepository alertRepo;
	
	public Soldier createSoldier( Soldier soldier) {
         return soldierRepo.save(soldier);
    }
	
	public void deletesoldier(Long id) {

		alertRepo.deleteBySoldierId(id);
	    locationRepo.deleteBySoldierId(id);

	    soldierRepo.deleteById(id);
	}
	
	public List<Soldier> getAllSoldier() {
        return soldierRepo.findAll();
    }

}
