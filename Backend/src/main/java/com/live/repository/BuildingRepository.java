package com.live.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.live.entity.Building;

@Repository
public interface BuildingRepository extends JpaRepository<Building, Long> {
	
}