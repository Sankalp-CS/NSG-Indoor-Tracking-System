import React, { useState, useEffect } from 'react'
import { Building2, Plus, Layers } from 'lucide-react'
import { Card, CardHeader, PageHeader, Table, Btn, Input, Modal, Badge, ErrorBox, StatCard } from '../components/ui.jsx'
import { getBuildings, createBuilding } from '../services/api.js'

export default function Buildings() {
  const [buildings, setBuildings] = useState([])
  const [loading, setLoading]     = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm]           = useState({ name: '', totalFloors: '', totalBasements: '', modelFilePath: '' })
  const [saving, setSaving]       = useState(false)
  const [error, setError]         = useState('')

  const load = async () => {
    setLoading(true)
    try { setBuildings(await getBuildings() || []) }
    catch (e) { setError(e.message) }
    finally { setLoading(false) }
  }
  useEffect(() => { load() }, [])

  const handleCreate = async () => {
    if (!form.name.trim() || !form.totalFloors || !form.modelFilePath.trim()) {
      setError('Name, floors and model path required'); return
    }
    setSaving(true); setError('')
    try {
      await createBuilding({
        name: form.name,
        totalFloors: parseInt(form.totalFloors),
        totalBasements: parseInt(form.totalBasements) || 0,
        modelFilePath: form.modelFilePath,
      })
      setShowModal(false); setForm({ name: '', totalFloors: '', totalBasements: '', modelFilePath: '' }); load()
    } catch (e) { setError(e.message) }
    finally { setSaving(false) }
  }

  const rows = buildings.map(b => [
    <span className="font-mono text-xs text-slate-dim">#{b.id}</span>,
    <span className="font-semibold text-white">{b.name}</span>,
    <span className="font-mono text-xs text-cyan-400">{b.totalFloors}F / {b.totalBasements}B</span>,
    <span className="font-mono text-xs text-slate-text truncate max-w-[200px] block" title={b.modelFilePath}>{b.modelFilePath}</span>,
    <Badge label="GLTF/GLB" color="blue" />,
  ])

  return (
    <div className="p-5 space-y-5 animate-fade-up">
      <PageHeader title="Building Registry" subtitle="3D model database — potential target structures">
        <Btn icon={Plus} onClick={() => { setShowModal(true); setError('') }}>Add Building</Btn>
      </PageHeader>

      <div className="grid grid-cols-3 gap-4">
        <StatCard label="Registered Buildings" value={buildings.length}                                         icon={Building2} accent="cyan"   />
        <StatCard label="Avg Floors"           value={buildings.length ? Math.round(buildings.reduce((a,b)=>a+b.totalFloors,0)/buildings.length) : 0} icon={Layers}   accent="blue"   />
        <StatCard label="With Basements"       value={buildings.filter(b=>b.totalBasements>0).length}           icon={Layers}   accent="yellow" />
      </div>

      <ErrorBox message={error} />

      <Card>
        <CardHeader title="Registered Structures" subtitle="GLTF/GLB 3D model database" icon={Building2} />
        <div className="p-4">
          {loading
            ? <div className="text-center py-12 text-slate-dim font-mono text-sm">Loading...</div>
            : <Table headers={['ID','Name','Structure','3D Model Path','Format']} rows={rows} emptyMsg="No buildings registered" />
          }
        </div>
      </Card>

      <div className="card p-4 border border-blue-500/20">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0">
            <Layers size={16} className="text-blue-400" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white mb-1">3D Model Integration</h4>
            <p className="text-xs text-slate-text leading-relaxed">
              The dashboard uses Three.js to render a procedural building based on floor/basement counts.
              The <code className="text-cyan-400 bg-navy-800 px-1 rounded">modelFilePath</code> field is reserved
              for loading external GLTF/GLB files via Three.js GLTFLoader when available.
              Soldier markers, red zone volumes and movement trails are placed in 3D space automatically.
            </p>
          </div>
        </div>
      </div>

      {showModal && (
        <Modal title="Register Building" onClose={() => setShowModal(false)}>
          <div className="space-y-4">
            <ErrorBox message={error} />
            <Input label="Building Name" placeholder="e.g. Taj Hotel Mumbai"
              value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
            <div className="grid grid-cols-2 gap-3">
              <Input label="Total Floors" type="number" min="1" placeholder="10"
                value={form.totalFloors} onChange={e => setForm({ ...form, totalFloors: e.target.value })} />
              <Input label="Total Basements" type="number" min="0" placeholder="2"
                value={form.totalBasements} onChange={e => setForm({ ...form, totalBasements: e.target.value })} />
            </div>
            <Input label="3D Model Path (GLTF/GLB)" placeholder="/models/taj_hotel.glb"
              hint="Served from Spring Boot static/models/ or Vite public/models/"
              value={form.modelFilePath} onChange={e => setForm({ ...form, modelFilePath: e.target.value })} />
            <div className="flex gap-2 pt-2">
              <Btn onClick={handleCreate} disabled={saving} className="flex-1">{saving ? 'Registering...' : 'Register Building'}</Btn>
              <Btn variant="ghost" onClick={() => setShowModal(false)}>Cancel</Btn>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
