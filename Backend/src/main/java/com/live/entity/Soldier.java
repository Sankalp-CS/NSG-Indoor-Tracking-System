package com.live.entity;

import jakarta.persistence.*;



@Entity
@Table(name = "soldiers")
public class Soldier {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String hitTeam;   

    @Column(nullable = false)
    private String status;    

	public Soldier() {
		super();
	}

	public Soldier(Long id, String name, String hitTeam, String status) {
		super();
		this.id = id;
		this.name = name;
		this.hitTeam = hitTeam;
		this.status = status;
	}

	public Long getId() {
		return id;
	}

	public String getName() {
		return name;
	}

	public String getHitTeam() {
		return hitTeam;
	}

	public String getStatus() {
		return status;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public void setName(String name) {
		this.name = name;
	}

	public void setHitTeam(String hitTeam) {
		this.hitTeam = hitTeam;
	}

	public void setStatus(String status) {
		this.status = status;
	}
    
    
}