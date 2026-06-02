package com.live.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "operations")
public class Operation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "building_id", nullable = false)
    private Building building;

    @Column(nullable = false)
    private String commanderName;

    @Column(nullable = false)
    private LocalDateTime startTime;

    @Column(nullable = false)
    private String status;   

	public Operation() {
		super();
	}

	public Operation(Long id, Building building, String commanderName, LocalDateTime startTime, String status) {
		super();
		this.id = id;
		this.building = building;
		this.commanderName = commanderName;
		this.startTime = startTime;
		this.status = status;
	}

	public Long getId() {
		return id;
	}

	public Building getBuilding() {
		return building;
	}

	public String getCommanderName() {
		return commanderName;
	}

	public LocalDateTime getStartTime() {
		return startTime;
	}

	public String getStatus() {
		return status;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public void setBuilding(Building building) {
		this.building = building;
	}

	public void setCommanderName(String commanderName) {
		this.commanderName = commanderName;
	}

	public void setStartTime(LocalDateTime startTime) {
		this.startTime = startTime;
	}

	public void setStatus(String status) {
		this.status = status;
	}
    
    
}