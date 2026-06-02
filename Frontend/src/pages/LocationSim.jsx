import React, { useState, useEffect, useRef } from 'react'
import { MapPin, Play, Square, Clock, Activity } from 'lucide-react'
import { Card, CardHeader, PageHeader, Btn, Input, Select, Badge, ErrorBox } from '../components/ui.jsx'
import { getSoldiers, getBuildings, updateLocation, getLocationHistory } from '../services/api.js'

export default function LocationSim() {
  const [soldiers, setSoldiers]         = useState([])
  const [buildings, setBuildings]       = useState([])
  const [form, setForm]                 = useState({ soldierId:'', buildingId:'', x:'50', y:'0', z:'50', floorNumber:'0' })
  const [log, setLog]                   = useState([])
  const [sending, setSending]           = useState(false)
  const [autoMode, setAutoMode]         = useState(false)
  const [error, setError]               = useState('')
  const [history, setHistory]           = useState([])
  const [loadingHistory, setLoadingHistory] = useState(false)
  const intervalRef = useRef(null)
  const logRef      = useRef(null)

  useEffect(() => {
    Promise.all([getSoldiers(), getBuildings()]).then(([s, b]) => {
      setSoldiers(s || []); setBuildings(b || [])
    })
    return () => clearInterval(intervalRef.current)
  }, [])

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight
  }, [log])

  useEffect(() => {
    if (form.soldierId) fetchHistory(form.soldierId)
  }, [form.soldierId])

  const fetchHistory = async (id) => {
    setLoadingHistory(true)
    try { setHistory(await getLocationHistory(id) || []) }
    catch {}
    finally { setLoadingHistory(false) }
  }

  const addLog = (msg, type = 'ok') =>
    setLog(prev => [...prev.slice(-99), { msg, type, time: new Date().toLocaleTimeString('en-IN') }])

  const sendUpdate = async (overrides = {}) => {
    const p = { ...form, ...overrides }
    if (!p.soldierId || !p.buildingId) { setError('Select soldier and building'); return false }
    try {
      await updateLocation({
        soldierId: Number(p.soldierId), buildingId: Number(p.buildingId),
        x: parseFloat(p.x), y: parseFloat(p.y), z: parseFloat(p.z),
        floorNumber: parseInt(p.floorNumber),
      })
      const sol = soldiers.find(s => s.id === Number(p.soldierId))
      addLog(`✓ ${sol?.name || 'Soldier'} → Floor ${p.floorNumber}  X:${parseFloat(p.x).toFixed(1)} Z:${parseFloat(p.z).toFixed(1)}`, 'ok')
      setError('')
      if (p.soldierId) fetchHistory(p.soldierId)
      return true
    } catch (e) { addLog(`✗ ${e.message}`, 'err'); setError(e.message); return false }
  }

  const handleSend = async () => { setSending(true); await sendUpdate(); setSending(false) }

  const toggleAuto = () => {
    if (autoMode) {
      clearInterval(intervalRef.current); setAutoMode(false)
      addLog('— Auto simulation stopped', 'info')
    } else {
      if (!form.soldierId || !form.buildingId) { setError('Select soldier and building'); return }
      setAutoMode(true)
      addLog('— Auto simulation started (every 2s)', 'info')
      intervalRef.current = setInterval(() => {
        setForm(prev => {
          const nx = Math.max(0, Math.min(100, parseFloat(prev.x) + (Math.random()-0.5)*6))
          const nz = Math.max(0, Math.min(100, parseFloat(prev.z) + (Math.random()-0.5)*6))
          const updated = { ...prev, x: nx.toFixed(1), z: nz.toFixed(1) }
          sendUpdate(updated)
          return updated
        })
      }, 2000)
    }
  }

  const floorLabel = n => Number(n)===0 ? 'Ground' : Number(n)>0 ? `Floor ${n}` : `Basement ${Math.abs(n)}`

  return (
    <div className="p-5 space-y-5 animate-fade-up">
      <PageHeader title="Location Input" subtitle="Send soldier position updates — simulate or relay from hardware" />

      <div className="grid grid-cols-2 gap-5">
        {/* Form */}
        <div className="space-y-4">
          <Card>
            <CardHeader title="Send Location Update" icon={MapPin} accent="cyan" />
            <div className="p-4 space-y-4">
              <ErrorBox message={error} />
              <Select label="Soldier" value={form.soldierId}
                onChange={e => setForm({ ...form, soldierId: e.target.value })}
                options={soldiers.map(s => ({ value: s.id, label: `${s.name} [${s.hitTeam}]` }))} />
              <Select label="Building" value={form.buildingId}
                onChange={e => setForm({ ...form, buildingId: e.target.value })}
                options={buildings.map(b => ({ value: b.id, label: b.name }))} />
              <Input label="Floor (0=ground, negative=basement)" type="number"
                value={form.floorNumber} onChange={e => setForm({ ...form, floorNumber: e.target.value })} />
              <div className="grid grid-cols-3 gap-2">
                <Input label="X" type="number" step="0.1" value={form.x} onChange={e => setForm({...form,x:e.target.value})} />
                <Input label="Y" type="number" step="0.1" value={form.y} onChange={e => setForm({...form,y:e.target.value})} />
                <Input label="Z" type="number" step="0.1" value={form.z} onChange={e => setForm({...form,z:e.target.value})} />
              </div>
              <div className="flex gap-2">
                <Btn icon={MapPin} onClick={handleSend} disabled={sending || autoMode} className="flex-1">
                  {sending ? 'Sending...' : 'Send Update'}
                </Btn>
                <Btn icon={autoMode ? Square : Play} variant={autoMode ? 'danger' : 'ghost'} onClick={toggleAuto}>
                  {autoMode ? 'Stop' : 'Auto'}
                </Btn>
              </div>
              {autoMode && (
                <div className="flex items-center gap-2 p-2 rounded-lg bg-green-500/10 border border-green-500/20">
                  <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-ping" />
                  <span className="text-xs font-mono text-green-400">Simulating random walk — every 2 seconds</span>
                </div>
              )}
            </div>
          </Card>

          <Card>
            <CardHeader title="API Reference" icon={Activity} accent="blue" />
            <div className="p-4 text-xs font-mono space-y-2">
              <div className="flex items-center gap-2">
                <Badge label="POST" color="green" />
                <span className="text-cyan-400">/api/location/update</span>
              </div>
              <pre className="bg-navy-800 border border-slate-border rounded-lg p-3 text-[11px] text-slate-text overflow-x-auto">{`{
  "soldierId":   1,
  "buildingId":  1,
  "x":           45.0,
  "y":           0.0,
  "z":           32.0,
  "floorNumber": 2
}`}</pre>
              <div className="text-slate-dim space-y-1 pt-1">
                <div>WS Broadcast: <span className="text-cyan-400">/topic/locations</span></div>
                <div>Alert Topic:  <span className="text-red-400">/topic/alerts</span></div>
                <div>History: <span className="text-blue-400">GET /api/location/history/{'{id}'}</span></div>
              </div>
            </div>
          </Card>
        </div>

        {/* Log + History */}
        <div className="space-y-4">
          <Card>
            <CardHeader title="Transmission Log" icon={Activity}
              actions={<span className="text-xs font-mono text-slate-dim">{log.length} entries</span>} />
            <div ref={logRef} className="p-3 h-52 overflow-y-auto space-y-0.5">
              {log.length === 0
                ? <div className="text-center py-8 text-slate-dim text-xs font-mono">Awaiting transmissions...</div>
                : log.map((entry, i) => (
                  <div key={i} className={`flex gap-3 text-xs font-mono py-0.5 ${
                    entry.type==='err' ? 'text-red-400' : entry.type==='info' ? 'text-slate-dim' : 'text-green-400'
                  }`}>
                    <span className="text-slate-dim flex-shrink-0">{entry.time}</span>
                    <span>{entry.msg}</span>
                  </div>
                ))
              }
            </div>
          </Card>

          <Card>
            <CardHeader title="Movement History" icon={Clock} accent="blue"
              subtitle={form.soldierId ? `${history.length} recorded positions` : 'Select a soldier'} />
            <div className="p-3 h-64 overflow-y-auto">
              {loadingHistory
                ? <div className="text-center py-8 text-slate-dim text-xs font-mono">Loading...</div>
                : history.length === 0
                  ? <div className="text-center py-8 text-slate-dim text-xs font-mono">No history available</div>
                  : [...history].reverse().map((loc, i) => (
                    <div key={i} className="flex items-center justify-between py-1.5 px-2 rounded hover:bg-navy-800 transition-colors">
                      <div className="flex items-center gap-2">
                        <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${i===0 ? 'bg-cyan-400 animate-pulse' : 'bg-slate-dim'}`} />
                        <span className="text-xs font-mono text-slate-text">
                          {floorLabel(loc.floorNumber)} — X:{Number(loc.x).toFixed(1)} Z:{Number(loc.z).toFixed(1)}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-slate-dim">
                        {loc.timestamp ? new Date(loc.timestamp).toLocaleTimeString('en-IN') : ''}
                      </span>
                    </div>
                  ))
              }
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
