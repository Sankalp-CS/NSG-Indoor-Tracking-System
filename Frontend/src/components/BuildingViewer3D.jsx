import React, { useRef, useEffect, useCallback, useState } from 'react'
import * as THREE from 'three'

// ─── Constants ────────────────────────────────────────────────────────────────
const FLOOR_HEIGHT = 3.2      // metres per floor
const FLOOR_THICKNESS = 0.28
const BUILDING_W = 18
const BUILDING_D = 14
const WALL_THICKNESS = 0.22
const SCALE = 0.18            // world coord 0–100 → scene units

const TEAM_COLORS = [
  0x00d4ff, 0x3b82f6, 0xa855f7,
  0xf59e0b, 0x22c55e, 0xec4899,
  0xf97316, 0x14b8a6,
]
const teamColorCache = {}
function teamColor(name) {
  if (!teamColorCache[name]) {
    const keys = Object.keys(teamColorCache)
    teamColorCache[name] = TEAM_COLORS[keys.length % TEAM_COLORS.length]
  }
  return teamColorCache[name]
}

// ─── Geometry helpers ─────────────────────────────────────────────────────────
function makeFloorSlab(scene, floorIndex, totalFloors, totalBasements) {
  const group = new THREE.Group()
  const y = floorIndex * FLOOR_HEIGHT

  // Floor slab
  const slabGeo = new THREE.BoxGeometry(BUILDING_W, FLOOR_THICKNESS, BUILDING_D)
  const slabMat = new THREE.MeshPhongMaterial({
    color: 0x0a1628,
    emissive: 0x091425,
    specular: 0x1a3a6a,
    shininess: 40,
  })
  const slab = new THREE.Mesh(slabGeo, slabMat)
  slab.position.y = y
  slab.receiveShadow = true
  group.add(slab)

  // Floor edge glow line
  const edgeGeo = new THREE.EdgesGeometry(slabGeo)
  const edgeMat = new THREE.LineBasicMaterial({ color: 0x00d4ff, transparent: true, opacity: 0.25 })
  const edges = new THREE.LineSegments(edgeGeo, edgeMat)
  edges.position.y = y
  group.add(edges)

  // Floor grid (on top of slab)
  const gridHelper = new THREE.GridHelper(BUILDING_W - 0.5, 10, 0x00d4ff, 0x0f2040)
  gridHelper.position.set(0, y + FLOOR_THICKNESS / 2 + 0.01, 0)
  gridHelper.material.transparent = true
  gridHelper.material.opacity = 0.15
  group.add(gridHelper)

  // Floor label (tiny indicator)
  scene.add(group)
  return { group, slab, y, edgeMat }
}

function makeWalls(scene, floorIndex) {
  const y = floorIndex * FLOOR_HEIGHT + FLOOR_THICKNESS / 2
  const h = FLOOR_HEIGHT - FLOOR_THICKNESS
  const wallMat = new THREE.MeshPhongMaterial({
    color: 0x071020,
    emissive: 0x050d1a,
    transparent: true,
    opacity: 0.55,
    side: THREE.DoubleSide,
  })

  const walls = []

  // Front wall (with gap for door on ground floor)
  const frontGeo = new THREE.BoxGeometry(BUILDING_W, h, WALL_THICKNESS)
  const front = new THREE.Mesh(frontGeo, wallMat)
  front.position.set(0, y + h / 2, BUILDING_D / 2)
  front.castShadow = true
  scene.add(front)
  walls.push(front)

  // Back wall
  const back = front.clone()
  back.position.z = -BUILDING_D / 2
  scene.add(back)
  walls.push(back)

  // Left wall
  const sideGeo = new THREE.BoxGeometry(WALL_THICKNESS, h, BUILDING_D)
  const left = new THREE.Mesh(sideGeo, wallMat)
  left.position.set(-BUILDING_W / 2, y + h / 2, 0)
  left.castShadow = true
  scene.add(left)
  walls.push(left)

  // Right wall
  const right = left.clone()
  right.position.x = BUILDING_W / 2
  scene.add(right)
  walls.push(right)

  // Window strips on front/back walls
  const windowMat = new THREE.MeshPhongMaterial({
    color: 0x00d4ff,
    emissive: 0x004466,
    transparent: true,
    opacity: 0.18,
  })
  for (let i = 0; i < 4; i++) {
    const winGeo = new THREE.BoxGeometry(2.5, 1.2, 0.05)
    const win = new THREE.Mesh(winGeo, windowMat)
    win.position.set(-6 + i * 4, y + h * 0.55, BUILDING_D / 2 + 0.15)
    scene.add(win)
    walls.push(win)

    const win2 = win.clone()
    win2.position.z = -BUILDING_D / 2 - 0.15
    scene.add(win2)
    walls.push(win2)
  }

  return walls
}

function makeSoldierMarker(scene, loc, color) {
  const group = new THREE.Group()

  const floorY = (loc.floorNumber ?? 0) * FLOOR_HEIGHT + FLOOR_THICKNESS / 2
  const wx = ((loc.x / 100) - 0.5) * (BUILDING_W - 2)
  const wz = ((loc.z / 100) - 0.5) * (BUILDING_D - 2)

  group.position.set(wx, floorY, wz)

  // Glowing sphere
  const sphereGeo = new THREE.SphereGeometry(0.28, 16, 16)
  const sphereMat = new THREE.MeshPhongMaterial({
    color,
    emissive: color,
    emissiveIntensity: 0.8,
    shininess: 80,
  })
  const sphere = new THREE.Mesh(sphereGeo, sphereMat)
  sphere.position.y = 0.6
  group.add(sphere)

  // Vertical beam of light going up
  const beamGeo = new THREE.CylinderGeometry(0.04, 0.04, FLOOR_HEIGHT * 0.5, 8)
  const beamMat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.25 })
  const beam = new THREE.Mesh(beamGeo, beamMat)
  beam.position.y = FLOOR_HEIGHT * 0.25 + 0.6
  group.add(beam)

  // Pulse ring on floor
  const ringGeo = new THREE.RingGeometry(0.35, 0.55, 32)
  const ringMat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.4, side: THREE.DoubleSide })
  const ring = new THREE.Mesh(ringGeo, ringMat)
  ring.rotation.x = -Math.PI / 2
  ring.position.y = 0.02
  group.add(ring)

  // Point light for local glow
  const light = new THREE.PointLight(color, 1.2, 4)
  light.position.y = 0.8
  group.add(light)

  scene.add(group)
  return { group, sphere, ring, ringMat, color, soldierId: loc.soldier?.id }
}

function makeRedZoneBox(scene, zone) {
  const floorY = (zone.floorNo ?? 0) * FLOOR_HEIGHT + FLOOR_THICKNESS / 2

  const minX = ((zone.minX / 100) - 0.5) * (BUILDING_W - 2)
  const maxX = ((zone.maxX / 100) - 0.5) * (BUILDING_W - 2)
  const minZ = (((zone.minZ ?? zone.minY ?? 0) / 100) - 0.5) * (BUILDING_D - 2)
  const maxZ = (((zone.maxZ ?? zone.maxY ?? 0) / 100) - 0.5) * (BUILDING_D - 2)

  const w = Math.abs(maxX - minX) || 1
  const d = Math.abs(maxZ - minZ) || 1
  const h = FLOOR_HEIGHT - FLOOR_THICKNESS - 0.1

  const geo = new THREE.BoxGeometry(w, h, d)
  const mat = new THREE.MeshPhongMaterial({
    color: 0xff2020,
    emissive: 0x880000,
    transparent: true,
    opacity: 0.18,
    side: THREE.DoubleSide,
    depthWrite: false,
  })
  const box = new THREE.Mesh(geo, mat)
  box.position.set(
    (minX + maxX) / 2,
    floorY + h / 2,
    (minZ + maxZ) / 2
  )
  scene.add(box)

  // Red wireframe outline
  const edgesGeo = new THREE.EdgesGeometry(geo)
  const edgesMat = new THREE.LineBasicMaterial({ color: 0xff4444, transparent: true, opacity: 0.7 })
  const edges = new THREE.LineSegments(edgesGeo, edgesMat)
  edges.position.copy(box.position)
  scene.add(edges)

  return { box, edges }
}

function makeTrail(scene, history, color, floorNumber) {
  const floorHistory = history.filter(h => (h.floorNumber ?? 0) === floorNumber)
  if (floorHistory.length < 2) return null

  const points = floorHistory.map(h => {
    const wx = ((h.x / 100) - 0.5) * (BUILDING_W - 2)
    const wy = floorNumber * FLOOR_HEIGHT + FLOOR_THICKNESS / 2 + 0.65
    const wz = ((h.z / 100) - 0.5) * (BUILDING_D - 2)
    return new THREE.Vector3(wx, wy, wz)
  })

  const geo = new THREE.BufferGeometry().setFromPoints(points)
  const mat = new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.45 })
  const line = new THREE.Line(geo, mat)
  scene.add(line)
  return line
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function BuildingViewer3D({
  locations = [],
  redZones = [],
  trails = {},
  totalFloors = 4,
  totalBasements = 0,
  selectedFloor = null,
  buildingName = 'TARGET STRUCTURE',
}) {
  const mountRef = useRef(null)
  const sceneRef = useRef(null)
  const rendererRef = useRef(null)
  const cameraRef = useRef(null)
  const frameRef = useRef(null)
  const markersRef = useRef([])
  const redZoneObjectsRef = useRef([])
  const trailObjectsRef = useRef([])
  const floorSlabsRef = useRef([])
  const isDragging = useRef(false)
  const isRightDrag = useRef(false)
  const lastMouse = useRef({ x: 0, y: 0 })
  const sphericalRef = useRef({ theta: Math.PI / 5, phi: Math.PI / 3.2, radius: 28 })
  const targetRef = useRef({ x: 0, y: totalFloors * FLOOR_HEIGHT * 0.4, z: 0 })
  const [hoveredSoldier, setHoveredSoldier] = useState(null)

  // ── Setup scene ──────────────────────────────────────────────────────────
  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setSize(mount.clientWidth, mount.clientHeight)
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    renderer.setClearColor(0x000000, 0)
    mount.appendChild(renderer.domElement)
    rendererRef.current = renderer

    // Scene
    const scene = new THREE.Scene()
    scene.fog = new THREE.Fog(0x020a18, 35, 80)
    sceneRef.current = scene

    // Camera
    const camera = new THREE.PerspectiveCamera(50, mount.clientWidth / mount.clientHeight, 0.1, 200)
    cameraRef.current = camera

    // Lighting
    const ambient = new THREE.AmbientLight(0x0a1a2e, 1.5)
    scene.add(ambient)

    const sun = new THREE.DirectionalLight(0x4488cc, 1.2)
    sun.position.set(20, 30, 15)
    sun.castShadow = true
    sun.shadow.mapSize.set(2048, 2048)
    sun.shadow.camera.far = 80
    scene.add(sun)

    const fill = new THREE.DirectionalLight(0x002244, 0.6)
    fill.position.set(-15, 10, -10)
    scene.add(fill)

    // Ground plane
    const groundGeo = new THREE.PlaneGeometry(60, 60, 30, 30)
    const groundMat = new THREE.MeshPhongMaterial({
      color: 0x020810,
      emissive: 0x010508,
      wireframe: false,
    })
    const ground = new THREE.Mesh(groundGeo, groundMat)
    ground.rotation.x = -Math.PI / 2
    ground.position.y = -0.02
    ground.receiveShadow = true
    scene.add(ground)

    // Ground grid
    const groundGrid = new THREE.GridHelper(60, 30, 0x00ff88, 0x004422)
    groundGrid.position.y = 0
    groundGrid.material.transparent = true
    groundGrid.material.opacity = 0.35
    scene.add(groundGrid)

    // Outer perimeter glow
    const perimGeo = new THREE.BoxGeometry(BUILDING_W + 0.5, 0.05, BUILDING_D + 0.5)
    const perimMat = new THREE.MeshBasicMaterial({ color: 0x00ff88, transparent: true, opacity: 0.5 })
    const perim = new THREE.Mesh(perimGeo, perimMat)
    perim.position.y = 0.01
    scene.add(perim)

    // Build floors
    const totalF = totalFloors + totalBasements
    const slabs = []
    for (let i = 0; i < totalF; i++) {
      const idx = i - totalBasements
      const slab = makeFloorSlab(scene, idx, totalFloors, totalBasements)
      makeWalls(scene, idx)
      slabs.push({ ...slab, floorIndex: idx })
    }
    floorSlabsRef.current = slabs

    // Roof cap
    const roofGeo = new THREE.BoxGeometry(BUILDING_W, FLOOR_THICKNESS * 1.5, BUILDING_D)
    const roofMat = new THREE.MeshPhongMaterial({ color: 0x061525, emissive: 0x030c16 })
    const roof = new THREE.Mesh(roofGeo, roofMat)
    roof.position.y = totalFloors * FLOOR_HEIGHT
    scene.add(roof)

    const roofEdge = new THREE.LineSegments(
      new THREE.EdgesGeometry(roofGeo),
      new THREE.LineBasicMaterial({ color: 0x00d4ff, transparent: true, opacity: 0.4 })
    )
    roofEdge.position.y = totalFloors * FLOOR_HEIGHT
    scene.add(roofEdge)

    // Animate
    let t = 0
    const animate = () => {
      frameRef.current = requestAnimationFrame(animate)
      t += 0.016

      // Pulse soldier rings
      markersRef.current.forEach(({ ring, ringMat }) => {
        if (ring && ringMat) {
          const scale = 1 + 0.3 * Math.sin(t * 2.5)
          ring.scale.set(scale, scale, scale)
          ringMat.opacity = 0.25 + 0.2 * Math.sin(t * 2.5)
        }
      })

      // Highlight selected floor
      floorSlabsRef.current.forEach(({ edgeMat, floorIndex }) => {
        if (selectedFloor !== null && floorIndex === selectedFloor) {
          edgeMat.opacity = 0.6 + 0.3 * Math.sin(t * 3)
          edgeMat.color.setHex(0x00ffff)
        } else {
          edgeMat.opacity = 0.2
          edgeMat.color.setHex(0x00d4ff)
        }
      })

      // Update camera from spherical
      const { theta, phi, radius } = sphericalRef.current
      const tgt = targetRef.current
      camera.position.set(
        tgt.x + radius * Math.sin(phi) * Math.sin(theta),
        tgt.y + radius * Math.cos(phi),
        tgt.z + radius * Math.sin(phi) * Math.cos(theta)
      )
      camera.lookAt(tgt.x, tgt.y, tgt.z)

      renderer.render(scene, camera)
    }
    animate()

    // Resize
    const onResize = () => {
      if (!mount) return
      camera.aspect = mount.clientWidth / mount.clientHeight
      camera.updateProjectionMatrix()
      renderer.setSize(mount.clientWidth, mount.clientHeight)
    }
    window.addEventListener('resize', onResize)

    return () => {
      cancelAnimationFrame(frameRef.current)
      window.removeEventListener('resize', onResize)
      renderer.dispose()
      if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement)
    }
  }, [totalFloors, totalBasements])

  // ── Update soldiers ──────────────────────────────────────────────────────
  useEffect(() => {
    const scene = sceneRef.current
    if (!scene) return

    // Remove old markers
    markersRef.current.forEach(({ group }) => scene.remove(group))
    markersRef.current = []

    locations.forEach(loc => {
      const color = teamColor(loc.soldier?.hitTeam || 'DEFAULT')
      const marker = makeSoldierMarker(scene, loc, color)
      markersRef.current.push(marker)
    })
  }, [locations])

  // ── Update red zones ─────────────────────────────────────────────────────
  useEffect(() => {
    const scene = sceneRef.current
    if (!scene) return

    redZoneObjectsRef.current.forEach(({ box, edges }) => {
      scene.remove(box); scene.remove(edges)
    })
    redZoneObjectsRef.current = []

    redZones.forEach(zone => {
      redZoneObjectsRef.current.push(makeRedZoneBox(scene, zone))
    })
  }, [redZones])

  // ── Update trails ────────────────────────────────────────────────────────
  useEffect(() => {
    const scene = sceneRef.current
    if (!scene) return

    trailObjectsRef.current.forEach(t => t && scene.remove(t))
    trailObjectsRef.current = []

    locations.forEach(loc => {
      const sid = loc.soldier?.id
      if (!sid || !trails[sid]) return
      const color = teamColor(loc.soldier?.hitTeam || 'DEFAULT')
      const floor = loc.floorNumber ?? 0
      const trail = makeTrail(scene, trails[sid], color, floor)
      if (trail) trailObjectsRef.current.push(trail)
    })
  }, [trails, locations])

  // ── Mouse controls ───────────────────────────────────────────────────────
  const onMouseDown = useCallback((e) => {
    isDragging.current = true
    isRightDrag.current = e.button === 2
    lastMouse.current = { x: e.clientX, y: e.clientY }
  }, [])

  const onMouseMove = useCallback((e) => {
    if (!isDragging.current) return
    const dx = e.clientX - lastMouse.current.x
    const dy = e.clientY - lastMouse.current.y
    lastMouse.current = { x: e.clientX, y: e.clientY }

    if (isRightDrag.current) {
      // Pan
      targetRef.current.x -= dx * 0.04
      targetRef.current.z += dy * 0.04
    } else {
      // Orbit
      sphericalRef.current.theta -= dx * 0.008
      sphericalRef.current.phi = Math.max(0.15, Math.min(Math.PI / 2.1, sphericalRef.current.phi + dy * 0.008))
    }
  }, [])

  const onMouseUp = useCallback(() => { isDragging.current = false }, [])

  const onWheel = useCallback((e) => {
  sphericalRef.current.radius = Math.max(
    8,
    Math.min(55, sphericalRef.current.radius + e.deltaY * 0.04)
  )
}, [])

  const onContextMenu = useCallback((e) => e.preventDefault(), [])

  return (
    <div className="relative w-full h-full" style={{ minHeight: 480 }}>
      <div
        ref={mountRef}
        className="w-full h-full rounded-lg overflow-hidden cursor-grab active:cursor-grabbing"
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
        onWheel={onWheel}
        onContextMenu={onContextMenu}
        style={{ background: 'linear-gradient(180deg, #020a18 0%, #030f22 60%, #010508 100%)' }}
      />

      {/* Controls hint */}
      <div className="absolute top-3 right-3 text-right space-y-0.5 pointer-events-none">
        <div className="text-[10px] font-mono text-slate-500">DRAG · ROTATE</div>
        <div className="text-[10px] font-mono text-slate-500">SCROLL · ZOOM</div>
        <div className="text-[10px] font-mono text-slate-500">RIGHT DRAG · PAN</div>
      </div>

      {/* Building label */}
      <div className="absolute bottom-3 left-3 pointer-events-none">
        <div className="text-[10px] font-mono text-cyan-500/60 tracking-widest uppercase">{buildingName}</div>
        <div className="text-[9px] font-mono text-slate-600 mt-0.5">
          {totalFloors}F / {totalBasements}B · {locations.length} UNITS · {redZones.length} ZONES
        </div>
      </div>

      {/* Legend */}
      <div className="absolute bottom-3 right-3 flex flex-col gap-1 pointer-events-none">
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-cyan-400"></div>
          <span className="text-[10px] font-mono text-slate-500">SOLDIER</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded bg-red-500/60 border border-red-400/60"></div>
          <span className="text-[10px] font-mono text-slate-500">RED ZONE</span>
        </div>
      </div>
    </div>
  )
}
