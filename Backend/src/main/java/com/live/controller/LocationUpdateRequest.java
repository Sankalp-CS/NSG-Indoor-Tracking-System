package com.live.controller;


public class LocationUpdateRequest {
    private Long soldierId;
    private Long buildingId;
    private double x;
    private double y;
    private double z;
    private int floorNumber;
	public LocationUpdateRequest() {
		super();
		// TODO Auto-generated constructor stub
	}
	public LocationUpdateRequest(Long soldierId, Long buildingId, double x, double y, double z, int floorNumber) {
		super();
		this.soldierId = soldierId;
		this.buildingId = buildingId;
		this.x = x;
		this.y = y;
		this.z = z;
		this.floorNumber = floorNumber;
	}
	public Long getSoldierId() {
		return soldierId;
	}
	public Long getBuildingId() {
		return buildingId;
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
	public void setSoldierId(Long soldierId) {
		this.soldierId = soldierId;
	}
	public void setBuildingId(Long buildingId) {
		this.buildingId = buildingId;
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
    
    
}