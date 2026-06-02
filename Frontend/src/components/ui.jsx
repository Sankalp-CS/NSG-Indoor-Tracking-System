import React from 'react'
import { X } from 'lucide-react'

export function Card({ children, className = '' }) {
  return <div className={`card ${className}`}>{children}</div>
}

export function CardHeader({ title, subtitle, icon: Icon, actions, accent = 'cyan' }) {
  const accentMap = {
    cyan:   'text-cyan-400 bg-cyan-400/10',
    blue:   'text-blue-400 bg-blue-400/10',
    red:    'text-red-400 bg-red-400/10',
    green:  'text-green-400 bg-green-400/10',
    yellow: 'text-yellow-400 bg-yellow-400/10',
  }
  return (
    <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-border">
      <div className="flex items-center gap-3">
        {Icon && (
          <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${accentMap[accent] || accentMap.cyan}`}>
            <Icon size={14} />
          </div>
        )}
        <div>
          <h3 className="font-display font-semibold text-white text-sm tracking-wide leading-tight">{title}</h3>
          {subtitle && <p className="text-xs text-slate-text mt-0.5">{subtitle}</p>}
        </div>
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  )
}

export function StatCard({ label, value, sub, icon: Icon, accent = 'cyan' }) {
  const s = {
    cyan:   { icon: 'text-cyan-400 bg-cyan-400/10',   val: 'text-cyan-400',   border: 'border-cyan-400/20'   },
    blue:   { icon: 'text-blue-400 bg-blue-400/10',   val: 'text-blue-400',   border: 'border-blue-400/20'   },
    red:    { icon: 'text-red-400 bg-red-400/10',     val: 'text-red-400',    border: 'border-red-400/20'    },
    green:  { icon: 'text-green-400 bg-green-400/10', val: 'text-green-400',  border: 'border-green-400/20'  },
    yellow: { icon: 'text-yellow-400 bg-yellow-400/10',val:'text-yellow-400', border: 'border-yellow-400/20' },
  }[accent] || {}

  return (
    <div className={`card p-4 border ${s.border} transition-all duration-200 hover:border-opacity-60`}>
      <div className="flex items-start justify-between mb-3">
        {Icon && (
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${s.icon}`}>
            <Icon size={16} />
          </div>
        )}
      </div>
      <div className={`font-display text-3xl font-bold num-display ${s.val} leading-none mb-1`}>{value}</div>
      <div className="text-xs text-slate-text font-medium">{label}</div>
      {sub && <div className="text-xs text-slate-dim mt-0.5">{sub}</div>}
    </div>
  )
}

export function Btn({ children, onClick, variant = 'primary', size = 'md', disabled = false, className = '', icon: Icon }) {
  const base = 'inline-flex items-center gap-2 font-medium rounded-lg transition-all duration-150 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed'
  const variants = {
    primary: 'bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 hover:border-cyan-400',
    blue:    'bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border border-blue-500/40 hover:border-blue-400',
    danger:  'bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 hover:border-red-400',
    success: 'bg-green-500/10 hover:bg-green-500/20 text-green-400 border border-green-500/30 hover:border-green-400',
    ghost:   'bg-transparent hover:bg-white/5 text-slate-text border border-slate-border hover:text-white',
    solid:   'bg-cyan-500 hover:bg-cyan-400 text-navy-900 border border-cyan-400 font-semibold',
  }
  const sizes = { sm: 'px-3 py-1.5 text-xs', md: 'px-4 py-2 text-sm', lg: 'px-5 py-2.5 text-sm' }
  return (
    <button onClick={onClick} disabled={disabled}
      className={`${base} ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${className}`}>
      {Icon && <Icon size={size === 'sm' ? 12 : 14} />}
      {children}
    </button>
  )
}

export function Input({ label, hint, error, ...props }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-xs font-medium text-slate-text uppercase tracking-wider">{label}</label>}
      <input {...props}
        className={`bg-navy-800 border text-sm text-white px-3 py-2.5 rounded-lg
          focus:outline-none focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-500/60
          placeholder:text-slate-dim transition-all duration-150
          ${error ? 'border-red-500/50' : 'border-slate-border hover:border-slate-dim'}`}
      />
      {hint && !error && <p className="text-xs text-slate-dim">{hint}</p>}
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  )
}

export function Select({ label, options = [], error, ...props }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-xs font-medium text-slate-text uppercase tracking-wider">{label}</label>}
      <select {...props}
        className={`bg-navy-800 border text-sm text-white px-3 py-2.5 rounded-lg
          focus:outline-none focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-500/60
          transition-all duration-150
          ${error ? 'border-red-500/50' : 'border-slate-border hover:border-slate-dim'}`}>
        <option value="">— Select —</option>
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  )
}

export function Badge({ label, color = 'cyan' }) {
  const colors = {
    cyan:   'bg-cyan-500/15 text-cyan-400 border-cyan-500/30',
    blue:   'bg-blue-500/15 text-blue-400 border-blue-500/30',
    green:  'bg-green-500/15 text-green-400 border-green-500/30',
    red:    'bg-red-500/15 text-red-400 border-red-500/30',
    yellow: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30',
    gray:   'bg-slate-500/15 text-slate-400 border-slate-500/30',
  }
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-mono font-medium border ${colors[color] || colors.gray}`}>
      {label}
    </span>
  )
}

export function Table({ headers, rows, emptyMsg = 'No data found' }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-border">
            {headers.map(h => (
              <th key={h} className="text-left text-xs font-medium text-slate-text uppercase tracking-wider py-3 px-4 first:pl-0">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-border/50">
          {rows.length === 0 ? (
            <tr><td colSpan={headers.length} className="text-center py-12 text-slate-dim text-sm font-mono">{emptyMsg}</td></tr>
          ) : (
            rows.map((row, i) => (
              <tr key={i} className="hover:bg-white/2 transition-colors">
                {row.map((cell, j) => <td key={j} className="py-3 px-4 first:pl-0 text-slate-300">{cell}</td>)}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}

export function Modal({ title, onClose, children, size = 'md' }) {
  const sizes = { sm: 'max-w-sm', md: 'max-w-md', lg: 'max-w-lg', xl: 'max-w-xl' }
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className={`card glow-border w-full ${sizes[size]} animate-fade-up`}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-border">
          <h2 className="font-display font-semibold text-white tracking-wide">{title}</h2>
          <button onClick={onClose} className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-text hover:text-white hover:bg-white/10 transition-all">
            <X size={15} />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  )
}

export function PageHeader({ title, subtitle, children }) {
  return (
    <div className="flex items-center justify-between px-6 py-5 border-b border-slate-border bg-navy-900/50">
      <div>
        <h1 className="font-display text-2xl font-bold text-white tracking-wide">{title}</h1>
        {subtitle && <p className="text-sm text-slate-text mt-0.5">{subtitle}</p>}
      </div>
      {children && <div className="flex items-center gap-2">{children}</div>}
    </div>
  )
}

export function LiveBadge() {
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-500/10 border border-green-500/30">
      <span className="relative flex h-1.5 w-1.5">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-400"></span>
      </span>
      <span className="text-xs font-mono font-medium text-green-400">LIVE</span>
    </span>
  )
}

export function ErrorBox({ message }) {
  if (!message) return null
  return (
    <div className="flex items-start gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
      <span className="mt-0.5">⚠</span><span>{message}</span>
    </div>
  )
}
