import React, { useState, useEffect } from 'react'
import { AlertTriangle, Plus, Trash2, Info } from 'lucide-react'
import { Card, CardHeader, PageHeader, Table, Btn, Input, Select, Modal, Badge, ErrorBox, StatCard } from '../components/ui.jsx'
import { getRedZones, createRedZone, deleteRedZone, getBuildings } from '../services/api.js'

export default function RedZones() {
  const [zones, setZones]         = useState([])
  const [buildings, setBuildings] = useState([])
  const [loading, setLoading]     = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [error, setError]         = useState('')
  const [saving, setSaving]       = useState(false)
  const [form, setForm]           = useState({
    buildingId: '', zoneName: '', floorNumber: '0',
    minX: '', maxX: '', minZ: '', maxZ: '',
  })

  const load = async () => {
    setLoading(true)
    try {
      const [z, b] = await Promise.all([getRedZones(), getBuildings()])
      setZones(z || []); setBuildings(b || [])
    } catch (e) { setError(e.message) }
    finally { setLoading(false) }
  }
  useEffect(() => { load() }, [])

  const handleCreate = async () => {
    if (!form.buildingId || !form.zoneName.trim()) { setError('Building and zone name required'); return }
    setSaving(true); setError('')
    try {
      await createRedZone({
        buildingId: Number(form.buildingId), zoneName: form.zoneName,
        floorNo: Number(form.floorNumber),
        minX: Number(form.minX), maxX: Number(form.maxX),
        minZ: Number(form.minZ), maxZ: Number(form.maxZ),
      })
      setShowModal(false)
      setForm({ buildingId:'', zoneName:'', floorNumber:'0', minX:'', maxX:'', minZ:'', maxZ:'' })
      load()
    } catch (e) { setError(e.message) }
    finally { setSaving(false) }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this red zone?')) return
    try { await deleteRedZone(id); load() } catch (e) { setError(e.message) }
  }

  const floorLabel = n => n === 0 ? 'Ground' : n > 0 ? `Floor ${n}` : `Basement ${Math.abs(n)}`
  const bldCounts  = {}
  zones.forEach(z => { const n = z.building?.name||'?'; bldCounts[n] = (bldCounts[n]||0)+1 })

  const rows = zones.map(z => [
    <span className="font-mono text-xs text-slate-dim">#{z.id}</span>,
    <span className="font-semibold text-red-300">{z.zoneName}</span>,
    <span className="text-cyan-400 text-sm">{z.building?.name || '—'}</span>,
    <Badge label={floorLabel(z.floorNo)} color="blue" />,
    <span className="font-mono text-xs text-slate-text">X[{z.minX}→{z.maxX}] Z[{z.minZ ?? z.minY}→{z.maxZ ?? z.maxY}]</span>,
    <Btn size="sm" variant="danger" icon={Trash2} onClick={() => handleDelete(z.id)} />,
  ])

  return (
    <div className="p-5 space-y-5 animate-fade-up">
      <PageHeader title="Red Zones" subtitle="Restricted / danger area definitions per floor">
        <Btn icon={Plus} variant="danger" onClick={() => { setShowModal(true); setError('') }}>Define Red Zone</Btn>
      </PageHeader>

      <div className="grid grid-cols-3 gap-4">
        <StatCard label="Total Red Zones"    value={zones.length}                          icon={AlertTriangle} accent="red"    />
        <StatCard label="Buildings Covered"  value={Object.keys(bldCounts).length}         icon={AlertTriangle} accent="yellow" />
        <StatCard label="Active Monitoring"  value={zones.length}                          icon={AlertTriangle} accent="cyan"   />
      </div>

      <ErrorBox message={error} />

      <div className="card p-4 border border-yellow-500/20 bg-yellow-500/5">
        <div className="flex items-start gap-3">
          <Info size={16} className="text-yellow-400 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-slate-text leading-relaxed">
            Red zones are 3D bounding boxes per floor. When a soldier's X/Z coordinates fall inside on the matching floor,
            an <span className="text-red-400 font-medium">ACTIVE alert</span> fires via WebSocket to the commander dashboard.
            In the 3D viewer they appear as semi-transparent red volumes inside the building.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader title="Defined Red Zones" subtitle={`${zones.length} zones`} icon={AlertTriangle} accent="red" />
        <div className="p-4">
          {loading
            ? <div className="text-center py-12 text-slate-dim font-mono text-sm">Loading...</div>
            : <Table headers={['ID','Zone Name','Building','Floor','Bounds (X & Z)','']} rows={rows} emptyMsg="No red zones defined" />
          }
        </div>
      </Card>

      {showModal && (
        <Modal title="Define Red Zone" onClose={() => setShowModal(false)}>
          <div className="space-y-4">
            <ErrorBox message={error} />
            <Input label="Zone Name" placeholder="e.g. LOBBY-NORTH, STAIRCASE-B2"
              value={form.zoneName} onChange={e => setForm({ ...form, zoneName: e.target.value })} />
            <Select label="Building" value={form.buildingId}
              onChange={e => setForm({ ...form, buildingId: e.target.value })}
              options={buildings.map(b => ({ value: b.id, label: b.name }))} />
            <Input label="Floor (0=ground, -1=basement 1)" type="number"
              value={form.floorNumber} onChange={e => setForm({ ...form, floorNumber: e.target.value })} />
            <div className="grid grid-cols-2 gap-2">
              <Input label="Min X" type="number" placeholder="0"  value={form.minX} onChange={e => setForm({...form,minX:e.target.value})} />
              <Input label="Max X" type="number" placeholder="50" value={form.maxX} onChange={e => setForm({...form,maxX:e.target.value})} />
              <Input label="Min Z" type="number" placeholder="0"  value={form.minZ} onChange={e => setForm({...form,minZ:e.target.value})} />
              <Input label="Max Z" type="number" placeholder="50" value={form.maxZ} onChange={e => setForm({...form,maxZ:e.target.value})} />
            </div>
            <div className="flex gap-2 pt-2">
              <Btn onClick={handleCreate} disabled={saving} variant="danger" className="flex-1">
                {saving ? 'Defining...' : '⚠ Define Red Zone'}
              </Btn>
              <Btn variant="ghost" onClick={() => setShowModal(false)}>Cancel</Btn>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
