package com.live.entity;

import java.util.List;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;

@Entity
@Table(name = "red_zone")
public class RedZone {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "building_id", nullable = false)
    private Building building;

    private String zoneName;

    private double minX;
    private double maxX;

    private double minZ;
    private double maxZ;

    private double floorNo;

    @OneToMany(mappedBy = "redZone", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Alert> alerts;

    public RedZone() {
        super();
    }

    public RedZone(Long id, Building building, String zoneName, double minX, double maxX, double minZ, double maxZ, double floorNo) {
        super();
        this.id = id;
        this.building = building;
        this.zoneName = zoneName;
        this.minX = minX;
        this.maxX = maxX;
        this.minZ = minZ;
        this.maxZ = maxZ;
        this.floorNo = floorNo;
    }

    public Long getId() { return id; }
    public Building getBuilding() { return building; }
    public String getZoneName() { return zoneName; }
    public double getMinX() { return minX; }
    public double getMaxX() { return maxX; }
    public double getMinZ() { return minZ; }
    public double getMaxZ() { return maxZ; }
    public double getFloorNo() { return floorNo; }

    public void setId(Long id) { this.id = id; }
    public void setBuilding(Building building) { this.building = building; }
    public void setZoneName(String zoneName) { this.zoneName = zoneName; }
    public void setMinX(double minX) { this.minX = minX; }
    public void setMaxX(double maxX) { this.maxX = maxX; }
    public void setMinZ(double minZ) { this.minZ = minZ; }
    public void setMaxZ(double maxZ) { this.maxZ = maxZ; }
    public void setFloorNo(double floorNo) { this.floorNo = floorNo; }
}
