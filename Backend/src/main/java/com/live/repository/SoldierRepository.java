package com.live.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.live.entity.Soldier;

@Repository
public interface SoldierRepository extends JpaRepository<Soldier, Long> {
}
