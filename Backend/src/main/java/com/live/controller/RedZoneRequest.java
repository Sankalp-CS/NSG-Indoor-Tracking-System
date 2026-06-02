package com.live.controller;



public class RedZoneRequest {
    private Long buildingId;
    private String zoneName;
    private int floorNumber;
    private double minX;
    private double maxX;
    private double minZ;
    private double maxZ;
	public Long getBuildingId() {
		return buildingId;
	}
	public String getZoneName() {
		return zoneName;
	}
	public int getFloorNumber() {
		return floorNumber;
	}
	public double getMinX() {
		return minX;
	}
	public double getMaxX() {
		return maxX;
	}
	public double getMinZ() {
		return minZ;
	}
	public double getMaxZ() {
		return maxZ;
	}
	public void setBuildingId(Long buildingId) {
		this.buildingId = buildingId;
	}
	public void setZoneName(String zoneName) {
		this.zoneName = zoneName;
	}
	public void setFloorNumber(int floorNumber) {
		this.floorNumber = floorNumber;
	}
	public void setMinX(double minX) {
		this.minX = minX;
	}
	public void setMaxX(double maxX) {
		this.maxX = maxX;
	}
	public void setMinZ(double minZ) {
		this.minZ = minZ;
	}
	public void setMaxZ(double maxZ) {
		this.maxZ = maxZ;
	}
	public RedZoneRequest(Long buildingId, String zoneName, int floorNumber, double minX, double maxX, double minZ,
			double maxZ) {
		super();
		this.buildingId = buildingId;
		this.zoneName = zoneName;
		this.floorNumber = floorNumber;
		this.minX = minX;
		this.maxX = maxX;
		this.minZ = minZ;
		this.maxZ = maxZ;
	}
	public RedZoneRequest() {
		super();
		// TODO Auto-generated constructor stub
	}
    
    
}