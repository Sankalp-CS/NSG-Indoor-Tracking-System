package com.live.entity;

import jakarta.persistence.*;



@Entity
@Table(name = "buildings")
public class Building {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private int totalFloors;

    @Column(nullable = false)
    private int totalBasements;

    @Column(nullable = false)
    private String modelFilePath; // path to GLTF/GLB 3D model file

	public Building() {
		super();
	}

	public Building(Long id, String name, int totalFloors, int totalBasements, String modelFilePath) {
		super();
		this.id = id;
		this.name = name;
		this.totalFloors = totalFloors;
		this.totalBasements = totalBasements;
		this.modelFilePath = modelFilePath;
	}

	public Long getId() {
		return id;
	}

	public String getName() {
		return name;
	}

	public int getTotalFloors() {
		return totalFloors;
	}

	public int getTotalBasements() {
		return totalBasements;
	}

	public String getModelFilePath() {
		return modelFilePath;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public void setName(String name) {
		this.name = name;
	}

	public void setTotalFloors(int totalFloors) {
		this.totalFloors = totalFloors;
	}

	public void setTotalBasements(int totalBasements) {
		this.totalBasements = totalBasements;
	}

	public void setModelFilePath(String modelFilePath) {
		this.modelFilePath = modelFilePath;
	}
    
    
}
