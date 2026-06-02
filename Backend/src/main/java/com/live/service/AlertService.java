package com.live.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import com.live.entity.Alert;
import com.live.entity.Location;
import com.live.entity.RedZone;
import com.live.repository.AlertRepository;
import com.live.repository.RedZoneRepository;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class AlertService {

    @Autowired
    private RedZoneRepository redZoneRepository;

    @Autowired
    private AlertRepository alertRepository;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    public void checkRedZones(Location location) {
        List<RedZone> zones = redZoneRepository.findByBuildingId(location.getBuilding().getId());

        for (RedZone zone : zones) {
            boolean onSameFloor = zone.getFloorNo() == location.getFloorNumber();
            boolean inX = location.getX() >= zone.getMinX() && location.getX() <= zone.getMaxX();
            boolean inZ = location.getZ() >= zone.getMinZ() && location.getZ() <= zone.getMaxZ();

            if (onSameFloor && inX && inZ) {
                // Prevent duplicate active alerts for same soldier + zone
                boolean alreadyActive = alertRepository
                        .existsBySoldierIdAndRedZoneIdAndStatus(
                                location.getSoldier().getId(), zone.getId(), "ACTIVE");

                if (!alreadyActive) {
                    Alert alert = new Alert();
                    alert.setSoldier(location.getSoldier());
                    alert.setRedZone(zone);
                    alert.setStatus("ACTIVE");
                    alert.setTriggeredAt(LocalDateTime.now());

                    Alert saved = alertRepository.save(alert);
                    messagingTemplate.convertAndSend("/topic/alerts", saved);
                }
            }
        }
    }

    public Alert sendCommanderMessage(Long alertId, String message) {
        Alert alert = alertRepository.findById(alertId)
                .orElseThrow(() -> new RuntimeException("Alert not found"));

        alert.setCommanderMessage(message);
        alert.setStatus("ACKNOWLEDGED");
        alert.setAcknowledgedAt(LocalDateTime.now());

        Alert saved = alertRepository.save(alert);

        messagingTemplate.convertAndSend(
            "/topic/messages/" + alert.getSoldier().getId(), saved
        );

        return saved;
    }

    public List<Alert> getActiveAlerts() {
        return alertRepository.findByStatus("ACTIVE");
    }
}
