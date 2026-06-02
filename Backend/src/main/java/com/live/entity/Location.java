package com.live.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "locations")
public class Location {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "soldier_id", nullable = false)
    private Soldier soldier;

    @ManyToOne
    @JoinColumn(name = "building_id", nullable = false)
    private Building building;

    @Column(nullable = false)
    private double x;           

    @Column(nullable = false)
    private double y;           

    @Column(nullable = false)
    private double z;           

    @Column(nullable = false)
    private int floorNumber;    

    @Column(nullable = false)
    private LocalDateTime timestamp;

	public Location() {
		super();
		// TODO Auto-generated constructor stub
	}

	public Location(Long id, Soldier soldier, Building building, double x, double y, double z, int floorNumber,
			LocalDateTime timestamp) {
		super();
		this.id = id;
		this.soldier = soldier;
		this.building = building;
		this.x = x;
		this.y = y;
		this.z = z;
		this.floorNumber = floorNumber;
		this.timestamp = timestamp;
	}

	public Long getId() {
		return id;
	}

	public Soldier getSoldier() {
		return soldier;
	}

	public Building getBuilding() {
		return building;
	}

	public double getX() {
		return x;
	}

	public double getY() {
		return y;
	}

	public double getZ() {
		return z;
	}

	public int getFloorNumber() {
		return floorNumber;
	}

	public LocalDateTime getTimestamp() {
		return timestamp;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public void setSoldier(Soldier soldier) {
		this.soldier = soldier;
	}

	public void setBuilding(Building building) {
		this.building = building;
	}

	public void setX(double x) {
		this.x = x;
	}

	public void setY(double y) {
		this.y = y;
	}

	public void setZ(double z) {
		this.z = z;
	}

	public void setFloorNumber(int floorNumber) {
		this.floorNumber = floorNumber;
	}

	public void setTimestamp(LocalDateTime timestamp) {
		this.timestamp = timestamp;
	}
    
    
    
}