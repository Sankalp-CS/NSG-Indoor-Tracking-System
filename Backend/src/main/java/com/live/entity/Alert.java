package com.live.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;


@Entity
@Table(name = "alerts")
public class Alert {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "soldier_id", nullable = false)
    private Soldier soldier;

    @ManyToOne
    @JoinColumn(name = "red_zone_id", nullable = false)
    private RedZone redZone;

    private String status; 

    private String commanderMessage;

    private LocalDateTime triggeredAt;
    private LocalDateTime acknowledgedAt;
	public Alert() {
		super();
	}
	public Alert(Long id, Soldier soldier, RedZone redZone, String status, String commanderMessage,
			LocalDateTime triggeredAt, LocalDateTime acknowledgedAt) {
		super();
		this.id = id;
		this.soldier = soldier;
		this.redZone = redZone;
		this.status = status;
		this.commanderMessage = commanderMessage;
		this.triggeredAt = triggeredAt;
		this.acknowledgedAt = acknowledgedAt;
	}
	public Long getId() {
		return id;
	}
	public Soldier getSoldier() {
		return soldier;
	}
	public RedZone getRedZone() {
		return redZone;
	}
	public String getStatus() {
		return status;
	}
	public String getCommanderMessage() {
		return commanderMessage;
	}
	public LocalDateTime getTriggeredAt() {
		return triggeredAt;
	}
	public LocalDateTime getAcknowledgedAt() {
		return acknowledgedAt;
	}
	public void setId(Long id) {
		this.id = id;
	}
	public void setSoldier(Soldier soldier) {
		this.soldier = soldier;
	}
	public void setRedZone(RedZone redZone) {
		this.redZone = redZone;
	}
	public void setStatus(String status) {
		this.status = status;
	}
	public void setCommanderMessage(String commanderMessage) {
		this.commanderMessage = commanderMessage;
	}
	public void setTriggeredAt(LocalDateTime triggeredAt) {
		this.triggeredAt = triggeredAt;
	}
	public void setAcknowledgedAt(LocalDateTime acknowledgedAt) {
		this.acknowledgedAt = acknowledgedAt;
	}
    
    
}