import React, { useState, useEffect, useCallback, useRef } from 'react'
import {
  Activity, Users, AlertTriangle, Shield,
  Send, Clock, Layers, Building2, ChevronUp, ChevronDown, Eye
} from 'lucide-react'
import { Card, CardHeader, StatCard, Btn, Badge, LiveBadge, Select, ErrorBox } from '../components/ui.jsx'
import BuildingViewer3D from '../components/BuildingViewer3D.jsx'
import {
  getAllLatestLocations, getActiveAlerts, sendCommanderMessage,
  getRedZones, getBuildings, getLocationHistory, getActiveOperations
} from '../services/api.js'
import { useWebSocket } from '../hooks/useWebSocket.js'

export default function Dashboard() {
  const [locations, setLocations] = useState([])
  const [alerts, setAlerts] = useState([])
  const [redZones, setRedZones] = useState([])
  const [buildings, setBuildings] = useState([])
  const [operations, setOperations] = useState([])
  const [trails, setTrails] = useState({})
  const [selectedBuilding, setSelectedBuilding] = useState(null)
  const [selectedFloor, setSelectedFloor] = useState(null)
  const [msgInputs, setMsgInputs] = useState({})
  const [sending, setSending] = useState({})
  const [error, setError] = useState('')
  const [viewMode, setViewMode] = useState('3d') // '3d' | '2d'

  const fetchAll = async () => {
    try {
      const [locs, alts, zones, blds, ops] = await Promise.all([
        getAllLatestLocations(), getActiveAlerts(), getRedZones(),
        getBuildings(), getActiveOperations()
      ])
      setLocations(locs || [])
      setAlerts(alts || [])
      setRedZones(zones || [])
      setBuildings(blds || [])
      setOperations(ops || [])
      if (blds?.length && !selectedBuilding) setSelectedBuilding(blds[0])
      for (const loc of (locs || [])) {
        if (loc.soldier?.id) fetchTrail(loc.soldier.id)
      }
    } catch (e) { setError(e.message) }
  }

  const fetchTrail = async (id) => {
    try {
      const h = await getLocationHistory(id)
      setTrails(prev => ({ ...prev, [id]: h || [] }))
    } catch {}
  }

  useEffect(() => { fetchAll() }, [])

  const handleLocation = useCallback((loc) => {
    setLocations(prev => {
      const idx = prev.findIndex(l => l.soldier?.id === loc.soldier?.id)
      if (idx >= 0) { const n = [...prev]; n[idx] = loc; return n }
      return [...prev, loc]
    })
    if (loc.soldier?.id) fetchTrail(loc.soldier.id)
  }, [])

  const handleAlert = useCallback((alert) => {
    setAlerts(prev => [alert, ...prev.filter(a => a.id !== alert.id)])
  }, [])

  useWebSocket({ onLocation: handleLocation, onAlert: handleAlert })

  const handleSendMsg = async (alertId) => {
    const msg = msgInputs[alertId]?.trim()
    if (!msg) return
    setSending(prev => ({ ...prev, [alertId]: true }))
    try {
      await sendCommanderMessage(alertId, msg)
      setAlerts(prev => prev.map(a =>
        a.id === alertId ? { ...a, status: 'ACKNOWLEDGED', commanderMessage: msg } : a
      ))
      setMsgInputs(prev => ({ ...prev, [alertId]: '' }))
    } catch (e) { setError(e.message) }
    finally { setSending(prev => ({ ...prev, [alertId]: false })) }
  }

  const activeAlerts = alerts.filter(a => a.status === 'ACTIVE')
  const allTeams = [...new Set(locations.map(l => l.soldier?.hitTeam).filter(Boolean))]

  // Filter locations/zones to selected building
  const buildingLocations = selectedBuilding
    ? locations.filter(l => l.building?.id === selectedBuilding.id)
    : locations
  const buildingZones = selectedBuilding
    ? redZones.filter(z => z.building?.id === selectedBuilding.id)
    : redZones

  // Floor counts for this building
  const floorCounts = {}
  buildingLocations.forEach(l => {
    const f = l.floorNumber ?? 0
    floorCounts[f] = (floorCounts[f] || 0) + 1
  })
  const floorsWithSoldiers = Object.keys(floorCounts).map(Number).sort((a, b) => b - a)

  return (
    <div className="p-5 space-y-4 animate-fade-up">
      <ErrorBox message={error} />

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard label="Soldiers Tracked" value={locations.length} sub={`/ ${locations.length} registered`} icon={Users} accent="cyan" />
        <StatCard label="Active Ops" value={operations.length} sub="ongoing" icon={Shield} accent="blue" />
        <StatCard label="Active Alerts" value={activeAlerts.length} sub="red zone breaches" icon={AlertTriangle} accent={activeAlerts.length > 0 ? 'red' : 'green'} />
        <StatCard label="Red Zones" value={redZones.length} sub="monitored areas" icon={Activity} accent="yellow" />
      </div>

      {/* Main layout */}
      <div className="grid grid-cols-4 gap-4" style={{ height: 580 }}>

        {/* 3D Viewer — takes 3 cols */}
        <div className="col-span-3 flex flex-col gap-0" style={{ height: 580 }}>
          <Card className="flex-1 flex flex-col overflow-hidden">
            <CardHeader
              title="3D Building — Live Tracking"
              icon={Building2}
              accent="cyan"
              actions={
                <div className="flex items-center gap-2">
                  <LiveBadge />
                  {/* Building picker */}
                  <select
                    value={selectedBuilding?.id || ''}
                    onChange={e => {
                      const b = buildings.find(b => b.id === Number(e.target.value))
                      setSelectedBuilding(b || null)
                    }}
                    className="bg-navy-800 border border-slate-border text-xs text-white px-2 py-1.5 rounded-lg
                      focus:outline-none focus:border-cyan-500/50"
                  >
                    {buildings.length === 0 && <option value="">No buildings</option>}
                    {buildings.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                  </select>
                </div>
              }
            />
            <div className="flex-1 relative">
              <BuildingViewer3D
                locations={buildingLocations}
                redZones={buildingZones}
                trails={trails}
                totalFloors={selectedBuilding?.totalFloors || 4}
                totalBasements={selectedBuilding?.totalBasements || 0}
                selectedFloor={selectedFloor}
                buildingName={selectedBuilding?.name || 'TARGET STRUCTURE'}
              />
            </div>
          </Card>
        </div>

        {/* Right sidebar — 1 col */}
        <div className="col-span-1 flex flex-col gap-4 overflow-y-auto" style={{ height: 580 }}>

          {/* Active Alerts */}
          <Card className={activeAlerts.length > 0 ? 'border-red-500/40 bg-red-500/5' : ''}>
            <CardHeader title="Active Alerts" icon={AlertTriangle} accent="red"
              actions={activeAlerts.length > 0 ? <Badge label={activeAlerts.length} color="red" /> : null} />
            <div className="p-3 space-y-2 max-h-48 overflow-y-auto">
              {activeAlerts.length === 0 ? (
                <div className="text-center py-4 text-xs font-mono text-slate-dim">No active alerts</div>
              ) : (
                activeAlerts.map(alert => (
                  <div key={alert.id} className="alert-pulse rounded-lg p-2.5 space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-red-400 rounded-full animate-ping flex-shrink-0" />
                      <div>
                        <div className="text-xs font-semibold text-red-300">{alert.soldier?.name}</div>
                        <div className="text-[10px] font-mono text-slate-dim">{alert.redZone?.zoneName}</div>
                      </div>
                    </div>
                    <div className="flex gap-1.5">
                      <input
                        value={msgInputs[alert.id] || ''}
                        onChange={e => setMsgInputs(prev => ({ ...prev, [alert.id]: e.target.value }))}
                        onKeyDown={e => e.key === 'Enter' && handleSendMsg(alert.id)}
                        placeholder="Commander message..."
                        className="flex-1 bg-navy-800 border border-slate-border text-xs text-white px-2 py-1.5 rounded-lg
                          focus:outline-none focus:border-red-500/50 placeholder:text-slate-dim min-w-0"
                      />
                      <button
                        onClick={() => handleSendMsg(alert.id)}
                        disabled={sending[alert.id] || !msgInputs[alert.id]?.trim()}
                        className="flex-shrink-0 w-7 h-7 bg-red-500/20 hover:bg-red-500/30 border border-red-500/40
                          rounded-lg flex items-center justify-center text-red-400 disabled:opacity-40 transition-all"
                      >
                        <Send size={11} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>

          {/* Active Operations */}
          <Card>
            <CardHeader title="Active Operations" icon={Shield} accent="blue" />
            <div className="p-3 space-y-2">
              {operations.length === 0 ? (
                <div className="text-center py-4 text-xs font-mono text-slate-dim">No active ops</div>
              ) : (
                operations.map(op => (
                  <div key={op.id} className="p-2.5 rounded-lg bg-green-500/5 border border-green-500/20">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-1.5 h-1.5 rounded-full status-dot-active" />
                      <span className="text-xs font-semibold text-white">{op.commanderName}</span>
                    </div>
                    <div className="text-[10px] font-mono text-slate-dim">{op.building?.name}</div>
                    <div className="text-[10px] font-mono text-slate-dim mt-0.5">
                      <Clock size={9} className="inline mr-1" />
                      {op.startTime ? new Date(op.startTime).toLocaleTimeString('en-IN') : '—'}
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>

          {/* Field personnel */}
          <Card className="flex-1">
            <CardHeader title="Field Personnel" icon={Users} accent="cyan" />
            <div className="p-3 space-y-1.5 max-h-64 overflow-y-auto">
              {buildingLocations.length === 0 ? (
                <div className="text-center py-4 text-xs font-mono text-slate-dim">No positions reported</div>
              ) : (
                buildingLocations.map(loc => (
                  <div
                    key={loc.id}
                    className="flex items-center gap-2 p-2 rounded-lg hover:bg-navy-800 cursor-pointer transition-colors group"
                    onClick={() => setSelectedFloor(
                      selectedFloor === loc.floorNumber ? null : loc.floorNumber
                    )}
                  >
                    <div
                        className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{
                          backgroundColor:
                            loc.soldier?.hitTeam === 'ALPHA'
                              ? '#00ffff'
                              : loc.soldier?.hitTeam === 'BRAVO'
                              ? '#ff0000'
                              : loc.soldier?.hitTeam === 'CHARLIE'
                              ? '#00ff00'
                              : '#ffffff'
                        }}
                      />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-medium text-white truncate">{loc.soldier?.name}</div>
                      <div className="text-[10px] font-mono text-slate-dim">
                        {loc.floorNumber === 0 ? 'Ground' : loc.floorNumber > 0 ? `F${loc.floorNumber}` : `B${Math.abs(loc.floorNumber)}`}
                        {' · '}X:{Number(loc.x).toFixed(0)} Z:{Number(loc.z).toFixed(0)}
                      </div>
                    </div>
                    <Badge label={loc.soldier?.hitTeam} color="cyan" />
                  </div>
                ))
              )}
            </div>
          </Card>

        </div>
      </div>
    </div>
  )
}
