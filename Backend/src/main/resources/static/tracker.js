// ─── SCENE SETUP ───────────────────────────────────────────
const canvas = document.getElementById('three-canvas');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setSize(canvas.parentElement.clientWidth, canvas.parentElement.clientHeight);
renderer.setClearColor(0x0a0f1e);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  60,
  canvas.parentElement.clientWidth / canvas.parentElement.clientHeight,
  0.1, 1000
);
camera.position.set(0, 80, 120);
camera.lookAt(0, 0, 0);

const ambient = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambient);
const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
dirLight.position.set(50, 100, 50);
scene.add(dirLight);

// ─── BUILDING ──────────────────────────────────────────────
const FLOOR_HEIGHT = 8;
const TOTAL_FLOORS = 6;
const TOTAL_BASEMENTS = 2;
const BUILDING_W = 40;
const BUILDING_D = 30;

const floorMeshes = {};

function buildBuilding() {
  for (let i = -TOTAL_BASEMENTS; i <= TOTAL_FLOORS - 1; i++) {
    const y = i * FLOOR_HEIGHT;

    const geo = new THREE.BoxGeometry(BUILDING_W, 0.5, BUILDING_D);
    const mat = new THREE.MeshLambertMaterial({
      color: i < 0 ? 0x1a3a2a : 0x1a2535,
      transparent: true, opacity: 0.85
    });
    const slab = new THREE.Mesh(geo, mat);
    slab.position.set(0, y, 0);
    scene.add(slab);

    const edges = new THREE.EdgesGeometry(geo);
    const outline = new THREE.LineSegments(edges,
      new THREE.LineBasicMaterial({ color: 0x00e5ff }));
    outline.position.set(0, y, 0);
    scene.add(outline);

    floorMeshes[i] = { slab, outline, y };
  }

  const wallMat = new THREE.MeshLambertMaterial({
    color: 0x1e3a5f, transparent: true, opacity: 0.12, side: THREE.DoubleSide
  });
  const wallGeo = new THREE.BoxGeometry(
    BUILDING_W,
    FLOOR_HEIGHT * (TOTAL_FLOORS + TOTAL_BASEMENTS),
    BUILDING_D
  );
  const wallMesh = new THREE.Mesh(wallGeo, wallMat);
  wallMesh.position.set(0, (FLOOR_HEIGHT * (TOTAL_FLOORS - TOTAL_BASEMENTS)) / 2 - FLOOR_HEIGHT, 0);
  scene.add(wallMesh);
}

buildBuilding();

// ─── RED ZONE VISUALIZATION ────────────────────────────────
function drawRedZones() {
  fetch('/api/alerts/redzone')
    .then(function(res) { return res.json(); })
    .then(function(zones) {
      zones.forEach(function(zone) {
        const w = zone.maxX - zone.minX;
        const d = zone.maxZ - zone.minZ;
        const cx = (zone.minX + zone.maxX) / 2;
        const cz = (zone.minZ + zone.maxZ) / 2;
        const y = zone.floorNumber * FLOOR_HEIGHT + 0.5;

        const geo = new THREE.BoxGeometry(w, 0.3, d);
        const mat = new THREE.MeshLambertMaterial({
          color: 0xff0000, transparent: true, opacity: 0.35
        });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.set(cx, y, cz);
        scene.add(mesh);

        const edges = new THREE.EdgesGeometry(geo);
        const line = new THREE.LineSegments(edges,
          new THREE.LineBasicMaterial({ color: 0xff0000 }));
        line.position.set(cx, y, cz);
        scene.add(line);
      });
    });
}

drawRedZones();

// ─── SOLDIER MARKERS ───────────────────────────────────────
const soldierMarkers = {};
const SOLDIER_COLORS = [0xff4444, 0x44ff88, 0xffaa00, 0x00aaff, 0xff00ff, 0xffffff];
let colorIndex = 0;

function getOrCreateMarker(soldierId, soldierName) {
  if (soldierMarkers[soldierId]) return soldierMarkers[soldierId];
  const color = SOLDIER_COLORS[colorIndex % SOLDIER_COLORS.length];
  colorIndex++;
  const geo = new THREE.SphereGeometry(1.2, 16, 16);
  const mat = new THREE.MeshLambertMaterial({ color });
  const mesh = new THREE.Mesh(geo, mat);
  scene.add(mesh);
  soldierMarkers[soldierId] = { mesh, color, name: soldierName };
  return soldierMarkers[soldierId];
}

function updateMarkerPosition(soldierId, soldierName, x, z, floorNumber) {
  const marker = getOrCreateMarker(soldierId, soldierName);
  const y = floorNumber * FLOOR_HEIGHT + 2;
  const clampedX = Math.max(-18, Math.min(18, x));
  const clampedZ = Math.max(-13, Math.min(13, z));
  marker.mesh.position.set(clampedX, y, clampedZ);
  marker.floorNumber = floorNumber;
}

// ─── SIDEBAR ───────────────────────────────────────────────
const soldierData = {};

function updateSidebar() {
  const list = document.getElementById('soldier-list');
  if (Object.keys(soldierData).length === 0) {
    list.innerHTML = '<p style="color:#64748b;font-size:13px;">Waiting for soldiers...</p>';
    return;
  }
  list.innerHTML = Object.values(soldierData).map(function(s) {
    return '<div class="soldier-card">' +
      '<div class="name">● ' + s.soldier.name + '</div>' +
      '<div class="team">' + s.soldier.hitTeam + '</div>' +
      '<div class="floor">Floor: ' + (s.floorNumber >= 0 ? 'F' + s.floorNumber : 'B' + Math.abs(s.floorNumber)) + '</div>' +
      '<div class="coords">X: ' + s.x.toFixed(1) + ' | Z: ' + s.z.toFixed(1) + '</div>' +
      '</div>';
  }).join('');
}

// ─── ALERTS ────────────────────────────────────────────────
const activeAlerts = {};

function showAlertPopup(alert) {
  const popup = document.getElementById('alert-popup');
  document.getElementById('popup-soldier').textContent =
    '👤 Soldier: ' + alert.soldier.name + ' (' + alert.soldier.hitTeam + ')';
  document.getElementById('popup-zone').textContent =
    '📍 Zone: ' + alert.redZone.zoneName;
  popup.style.display = 'block';

  // Play beep sound
  /*try {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    osc.connect(ctx.destination);
    osc.frequency.value = 880;
    osc.start();
    osc.stop(ctx.currentTime + 0.3);
  } catch(e) {}*/
}

document.getElementById('popup-dismiss').addEventListener('click', function() {
  document.getElementById('alert-popup').style.display = 'none';
});

function renderAlerts() {
  const list = document.getElementById('alert-list');
  const alerts = Object.values(activeAlerts);
  if (alerts.length === 0) {
    list.innerHTML = '<p style="color:#64748b;font-size:13px;">No active alerts</p>';
    return;
  }

  list.innerHTML = alerts.map(function(alert) {
    const isAck = alert.status === 'ACKNOWLEDGED';
    return '<div class="alert-card ' + (isAck ? 'acknowledged' : '') + '" id="alert-' + alert.id + '">' +
      '<div class="alert-title">' + (isAck ? '✅' : '🚨') + ' ' + alert.redZone.zoneName + '</div>' +
      '<div class="alert-info">Soldier: ' + alert.soldier.name + '</div>' +
      '<div class="alert-info">Team: ' + alert.soldier.hitTeam + '</div>' +
      (isAck
        ? '<div style="color:#4ade80;font-size:12px;">Message sent: ' + alert.commanderMessage + '</div>'
        : '<input type="text" id="msg-' + alert.id + '" placeholder="Type message to soldier..."/>' +
          '<button data-id="' + alert.id + '" class="send-msg-btn">📡 Send to Soldier</button>'
      ) +
      '</div>';
  }).join('');

  // Attach send button listeners
  document.querySelectorAll('.send-msg-btn').forEach(function(btn) {
    btn.addEventListener('click', function() {
      const alertId = btn.getAttribute('data-id');
      const msg = document.getElementById('msg-' + alertId).value;
      if (!msg.trim()) { alert('Please type a message!'); return; }
      sendCommanderMessage(alertId, msg);
    });
  });
}

function sendCommanderMessage(alertId, message) {
  fetch('/api/alerts/' + alertId + '/message', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: message })
  })
  .then(function(res) { return res.json(); })
  .then(function(updated) {
    activeAlerts[updated.id] = updated;
    renderAlerts();
  });
}

// ─── WEBSOCKET ─────────────────────────────────────────────
function connectWebSocket() {
  const socket = new SockJS('/ws');
  const stompClient = Stomp.over(socket);
  stompClient.debug = null;

  stompClient.connect({}, function() {
    document.getElementById('ws-status').textContent = 'Connected ✓';
    document.getElementById('ws-status').style.color = '#4ade80';

    // Location updates
    stompClient.subscribe('/topic/locations', function(message) {
      const location = JSON.parse(message.body);
      const id = location.soldier.id;
      soldierData[id] = location;
      updateMarkerPosition(id, location.soldier.name, location.x, location.z, location.floorNumber);
      updateSidebar();
    });

    // Alert updates
    stompClient.subscribe('/topic/alerts', function(message) {
      const alert = JSON.parse(message.body);
      activeAlerts[alert.id] = alert;
      showAlertPopup(alert);
      renderAlerts();
    });

  }, function() {
    document.getElementById('ws-status').textContent = 'Disconnected ✗';
    document.getElementById('ws-status').style.color = '#f87171';
    setTimeout(connectWebSocket, 3000);
  });
}

// Load existing data on page load
fetch('/api/location/all')
  .then(function(res) { return res.json(); })
  .then(function(locations) {
    locations.forEach(function(location) {
      const id = location.soldier.id;
      soldierData[id] = location;
      updateMarkerPosition(id, location.soldier.name, location.x, location.z, location.floorNumber);
    });
    updateSidebar();
  }).catch(function() {});

fetch('/api/alerts/active')
  .then(function(res) { return res.json(); })
  .then(function(alerts) {
    alerts.forEach(function(a) { activeAlerts[a.id] = a; });
    renderAlerts();
  }).catch(function() {});

connectWebSocket();

// ─── FLOOR BUTTONS ─────────────────────────────────────────
document.querySelectorAll('.floor-btn').forEach(function(btn) {
  btn.addEventListener('click', function() {
    const floor = parseInt(btn.getAttribute('data-floor'));
    document.querySelectorAll('.floor-btn').forEach(function(b) {
      b.classList.remove('active');
    });
    btn.classList.add('active');

    Object.entries(soldierMarkers).forEach(function(entry) {
      entry[1].mesh.visible = (entry[1].floorNumber === floor);
    });

    Object.entries(floorMeshes).forEach(function(entry) {
      entry[1].slab.material.opacity = (parseInt(entry[0]) === floor) ? 0.95 : 0.3;
    });
  });
});

// ─── ORBIT CONTROLS ────────────────────────────────────────
let isDragging = false;
let prevMouse = { x: 0, y: 0 };
let spherical = { theta: 0.5, phi: 0.8, radius: 150 };

canvas.addEventListener('mousedown', function(e) {
  isDragging = true;
  prevMouse = { x: e.clientX, y: e.clientY };
});
canvas.addEventListener('mouseup', function() { isDragging = false; });
canvas.addEventListener('mousemove', function(e) {
  if (!isDragging) return;
  spherical.theta -= (e.clientX - prevMouse.x) * 0.005;
  spherical.phi -= (e.clientY - prevMouse.y) * 0.005;
  spherical.phi = Math.max(0.1, Math.min(Math.PI / 2, spherical.phi));
  prevMouse = { x: e.clientX, y: e.clientY };
});
canvas.addEventListener('wheel', function(e) {
  spherical.radius += e.deltaY * 0.2;
  spherical.radius = Math.max(50, Math.min(300, spherical.radius));
});

// ─── ANIMATION LOOP ────────────────────────────────────────
function animate() {
  requestAnimationFrame(animate);
  camera.position.x = spherical.radius * Math.sin(spherical.phi) * Math.sin(spherical.theta);
  camera.position.y = spherical.radius * Math.cos(spherical.phi);
  camera.position.z = spherical.radius * Math.sin(spherical.phi) * Math.cos(spherical.theta);
  camera.lookAt(0, 20, 0);
  renderer.render(scene, camera);
}
animate();

window.addEventListener('resize', function() {
  const w = canvas.parentElement.clientWidth;
  const h = canvas.parentElement.clientHeight;
  renderer.setSize(w, h);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
});