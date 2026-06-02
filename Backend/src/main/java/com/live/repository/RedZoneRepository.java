package com.live.repository;


import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.live.entity.RedZone;


@Repository
public interface RedZoneRepository extends JpaRepository<RedZone, Long>{
		List<RedZone> findByBuildingId(Long buildingId);

}
