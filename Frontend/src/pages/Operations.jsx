import React, { useState, useEffect } from 'react'
import { Shield, Plus, CheckCircle, XCircle, Trash2, Clock } from 'lucide-react'
import { Card, CardHeader, PageHeader, Table, Btn, Input, Select, Modal, Badge, ErrorBox, StatCard } from '../components/ui.jsx'
import { getOperations, createOperation, updateOperationStatus, deleteOperation, getBuildings } from '../services/api.js'

const statusColor = s => ({ ACTIVE: 'green', COMPLETED: 'blue', ABORTED: 'red' })[s] || 'gray'

export default function Operations() {
  const [operations, setOperations] = useState([])
  const [buildings, setBuildings]   = useState([])
  const [loading, setLoading]       = useState(true)
  const [showModal, setShowModal]   = useState(false)
  const [form, setForm]             = useState({ commanderName: '', buildingId: '' })
  const [saving, setSaving]         = useState(false)
  const [error, setError]           = useState('')

  const load = async () => {
    setLoading(true)
    try {
      const [ops, blds] = await Promise.all([getOperations(), getBuildings()])
      setOperations(ops || []); setBuildings(blds || [])
    } catch (e) { setError(e.message) }
    finally { setLoading(false) }
  }
  useEffect(() => { load() }, [])

  const handleCreate = async () => {
    if (!form.commanderName.trim() || !form.buildingId) { setError('Commander name and building required'); return }
    setSaving(true); setError('')
    try {
      await createOperation({ commanderName: form.commanderName, buildingId: Number(form.buildingId) })
      setShowModal(false); setForm({ commanderName: '', buildingId: '' }); load()
    } catch (e) { setError(e.message) }
    finally { setSaving(false) }
  }

  const handleStatus = async (id, status) => {
    try { await updateOperationStatus(id, status); load() } catch (e) { setError(e.message) }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this operation?')) return
    try { await deleteOperation(id); load() } catch (e) { setError(e.message) }
  }

  const active    = operations.filter(o => o.status === 'ACTIVE')
  const completed = operations.filter(o => o.status === 'COMPLETED')
  const aborted   = operations.filter(o => o.status === 'ABORTED')

  const rows = operations.map(op => [
    <span className="font-mono text-xs text-slate-dim">#{op.id}</span>,
    <span className="font-semibold text-white">{op.commanderName}</span>,
    <span className="text-cyan-400 text-sm">{op.building?.name || '—'}</span>,
    <div className="flex items-center gap-1 text-xs font-mono text-slate-dim">
      <Clock size={11} />
      {op.startTime ? new Date(op.startTime).toLocaleString('en-IN', { day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit' }) : '—'}
    </div>,
    <Badge label={op.status} color={statusColor(op.status)} />,
    <div className="flex items-center gap-1">
      {op.status === 'ACTIVE' && <>
        <Btn size="sm" variant="success" icon={CheckCircle} onClick={() => handleStatus(op.id,'COMPLETED')} />
        <Btn size="sm" variant="danger"  icon={XCircle}     onClick={() => handleStatus(op.id,'ABORTED')} />
      </>}
      <Btn size="sm" variant="ghost" icon={Trash2} onClick={() => handleDelete(op.id)} />
    </div>,
  ])

  return (
    <div className="p-5 space-y-5 animate-fade-up">
      <PageHeader title="Operations" subtitle="Integrated Command Post — operation management">
        <Btn icon={Plus} variant="solid" onClick={() => { setShowModal(true); setError('') }}>Initiate Operation</Btn>
      </PageHeader>

      <div className="grid grid-cols-4 gap-4">
        <StatCard label="Total"     value={operations.length} icon={Shield}       accent="cyan"  />
        <StatCard label="Active"    value={active.length}     icon={Shield}       accent="green" />
        <StatCard label="Completed" value={completed.length}  icon={CheckCircle}  accent="blue"  />
        <StatCard label="Aborted"   value={aborted.length}    icon={XCircle}      accent="red"   />
      </div>

      <ErrorBox message={error} />

      {active.length > 0 && (
        <div className="space-y-3">
          {active.map(op => (
            <div key={op.id} className="card border border-green-500/30 bg-green-500/5 p-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                    <Shield size={18} className="text-green-400" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-ping" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-white">CMD: {op.commanderName}</div>
                  <div className="text-xs text-slate-text">{op.building?.name} — {op.startTime ? new Date(op.startTime).toLocaleTimeString('en-IN') : '—'}</div>
                </div>
              </div>
              <div className="flex gap-2">
                <Btn size="sm" variant="success" icon={CheckCircle} onClick={() => handleStatus(op.id,'COMPLETED')}>Complete</Btn>
                <Btn size="sm" variant="danger"  icon={XCircle}     onClick={() => handleStatus(op.id,'ABORTED')}>Abort</Btn>
              </div>
            </div>
          ))}
        </div>
      )}

      <Card>
        <CardHeader title="Operation Log" subtitle="All operations history" icon={Shield} />
        <div className="p-4">
          {loading
            ? <div className="text-center py-12 text-slate-dim font-mono text-sm">Loading...</div>
            : <Table headers={['ID','Commander','Building','Started','Status','Actions']} rows={rows} emptyMsg="No operations on record" />
          }
        </div>
      </Card>

      {showModal && (
        <Modal title="Initiate New Operation" onClose={() => setShowModal(false)}>
          <div className="space-y-4">
            <ErrorBox message={error} />
            <Input label="Commanding Officer" placeholder="e.g. Col. Rajesh Kumar"
              value={form.commanderName} onChange={e => setForm({ ...form, commanderName: e.target.value })} />
            <Select label="Target Building" value={form.buildingId}
              onChange={e => setForm({ ...form, buildingId: e.target.value })}
              options={buildings.map(b => ({ value: b.id, label: b.name }))} />
            <div className="flex gap-2 pt-2">
              <Btn onClick={handleCreate} disabled={saving} variant="solid" className="flex-1">
                {saving ? 'Initiating...' : '⚡ Initiate Operation'}
              </Btn>
              <Btn variant="ghost" onClick={() => setShowModal(false)}>Cancel</Btn>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
