import React, { useState, useEffect } from 'react'
import { Users, Plus, Trash2, UserCheck } from 'lucide-react'
import { Card, CardHeader, PageHeader, Table, Btn, Input, Select, Modal, Badge, ErrorBox, StatCard } from '../components/ui.jsx'
import { getSoldiers, createSoldier, deleteSoldier } from '../services/api.js'

const STATUS_OPTIONS = [
  { value: 'ACTIVE',   label: 'Active'   },
  { value: 'STANDBY',  label: 'Standby'  },
  { value: 'INJURED',  label: 'Injured'  },
]
const statusColor = s => ({ ACTIVE: 'green', STANDBY: 'blue', INJURED: 'yellow' })[s] || 'gray'

export default function Soldiers() {
  const [soldiers, setSoldiers]   = useState([])
  const [loading, setLoading]     = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm]           = useState({ name: '', hitTeam: '', status: 'ACTIVE' })
  const [saving, setSaving]       = useState(false)
  const [error, setError]         = useState('')
  const [filter, setFilter]       = useState('')

  const load = async () => {
    setLoading(true)
    try { setSoldiers(await getSoldiers() || []) }
    catch (e) { setError(e.message) }
    finally { setLoading(false) }
  }
  useEffect(() => { load() }, [])

  const handleCreate = async () => {
    if (!form.name.trim() || !form.hitTeam.trim()) { setError('Name and HIT Team required'); return }
    setSaving(true); setError('')
    try {
      await createSoldier(form)
      setShowModal(false); setForm({ name: '', hitTeam: '', status: 'ACTIVE' }); load()
    } catch (e) { setError(e.message) }
    finally { setSaving(false) }
  }

  const handleDelete = async (id) => {
    if (!confirm('Remove this soldier?')) return
    try { await deleteSoldier(id); load() } catch (e) { setError(e.message) }
  }

  const filtered = soldiers.filter(s =>
    !filter ||
    s.name?.toLowerCase().includes(filter.toLowerCase()) ||
    s.hitTeam?.toLowerCase().includes(filter.toLowerCase())
  )

  const teams   = [...new Set(soldiers.map(s => s.hitTeam).filter(Boolean))]
  const active  = soldiers.filter(s => s.status === 'ACTIVE').length
  const injured = soldiers.filter(s => s.status === 'INJURED').length

  const rows = filtered.map(s => [
    <span className="font-mono text-xs text-slate-dim">#{s.id}</span>,
    <span className="font-semibold text-white">{s.name}</span>,
    <Badge label={s.hitTeam} color="cyan" />,
    <Badge label={s.status} color={statusColor(s.status)} />,
    <Btn size="sm" variant="danger" icon={Trash2} onClick={() => handleDelete(s.id)} />,
  ])

  return (
    <div className="p-5 space-y-5 animate-fade-up">
      <PageHeader title="Personnel Registry" subtitle="House Intervention Team — soldier management">
        <Btn icon={Plus} onClick={() => { setShowModal(true); setError('') }}>Add Soldier</Btn>
      </PageHeader>

      <div className="grid grid-cols-4 gap-4">
        <StatCard label="Total Personnel" value={soldiers.length} icon={Users}      accent="cyan"   />
        <StatCard label="HIT Teams"       value={teams.length}    icon={UserCheck}  accent="blue"   />
        <StatCard label="Active"          value={active}          icon={UserCheck}  accent="green"  />
        <StatCard label="Injured"         value={injured}         icon={UserCheck}  accent="yellow" />
      </div>

      <ErrorBox message={error} />

      <Card>
        <CardHeader title="Registered Personnel" subtitle={`${filtered.length} of ${soldiers.length} soldiers`} icon={Users}
          actions={
            <input value={filter} onChange={e => setFilter(e.target.value)} placeholder="Search name or team..."
              className="bg-navy-800 border border-slate-border text-sm text-white px-3 py-1.5 rounded-lg
                focus:outline-none focus:border-cyan-500/50 placeholder:text-slate-dim w-52" />
          }
        />
        <div className="p-4">
          {loading
            ? <div className="text-center py-12 text-slate-dim font-mono text-sm">Loading...</div>
            : <Table headers={['ID','Name','HIT Team','Status','']} rows={rows} emptyMsg="No personnel registered" />
          }
        </div>
      </Card>

      {showModal && (
        <Modal title="Register New Soldier" onClose={() => setShowModal(false)}>
          <div className="space-y-4">
            <ErrorBox message={error} />
            <Input label="Full Name" placeholder="e.g. Subedar Rajan Singh"
              value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
            <Input label="HIT Team" placeholder="e.g. ALPHA, BRAVO, CHARLIE"
              value={form.hitTeam} onChange={e => setForm({ ...form, hitTeam: e.target.value })} />
            <Select label="Status" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} options={STATUS_OPTIONS} />
            <div className="flex gap-2 pt-2">
              <Btn onClick={handleCreate} disabled={saving} className="flex-1">{saving ? 'Registering...' : 'Register Soldier'}</Btn>
              <Btn variant="ghost" onClick={() => setShowModal(false)}>Cancel</Btn>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
