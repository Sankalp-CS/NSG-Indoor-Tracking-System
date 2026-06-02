import React, { useState } from 'react'
import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard, Users, Building2, Shield,
  AlertTriangle, MapPin, ChevronLeft, ChevronRight, Radio, Bell
} from 'lucide-react'

const NAV = [
  { to: '/',             label: 'Dashboard',      icon: LayoutDashboard },
  { to: '/soldiers',     label: 'Personnel',      icon: Users           },
  { to: '/buildings',    label: 'Buildings',      icon: Building2       },
  { to: '/operations',   label: 'Operations',     icon: Shield          },
  { to: '/redzones',     label: 'Red Zones',      icon: AlertTriangle   },
  { to: '/location-sim', label: 'Location Input', icon: MapPin          },
]

export default function Layout({ children, alertCount = 0 }) {
  const [collapsed, setCollapsed] = useState(false)
  const now = new Date()

  return (
    <div className="flex h-screen overflow-hidden bg-navy-950">
      {/* Sidebar */}
      <aside className={`relative flex flex-col bg-navy-900 border-r border-slate-border transition-all duration-300 flex-shrink-0 ${collapsed ? 'w-[60px]' : 'w-[220px]'}`}>
        <div className="topbar-line w-full" />
        {/* Logo */}
        <div className={`flex items-center gap-3 px-4 py-5 border-b border-slate-border ${collapsed ? 'justify-center px-2' : ''}`}>
          <div className="relative flex-shrink-0">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center">
              <Radio size={15} className="text-cyan-400" />
            </div>
            <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-green-400 rounded-full border border-navy-900 animate-pulse" />
          </div>
          {!collapsed && (
            <div>
              <div className="font-display font-bold text-white text-base tracking-widest leading-none">NSG ICP</div>
              <div className="text-[9px] font-mono text-slate-text tracking-widest mt-0.5">LIVE TRACKER</div>
            </div>
          )}
        </div>
        {/* Nav */}
        <nav className="flex-1 py-3 overflow-y-auto overflow-x-hidden">
          {!collapsed && (
            <div className="px-4 mb-2">
              <span className="text-[10px] font-mono text-slate-dim uppercase tracking-widest">Navigation</span>
            </div>
          )}
          {NAV.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} end={to === '/'}
              className={({ isActive }) =>
                `nav-item flex items-center gap-3 mx-2 px-3 py-2.5 rounded-lg mb-0.5 text-sm
                ${isActive ? 'nav-active font-medium' : 'text-slate-text'}`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon size={16} className={isActive ? 'text-cyan-400' : 'text-slate-dim'} />
                  {!collapsed && <span className="truncate">{label}</span>}
                  {!collapsed && to === '/' && alertCount > 0 && (
                    <span className="ml-auto bg-red-500 text-white text-[10px] font-mono px-1.5 py-0.5 rounded-full min-w-[18px] text-center animate-pulse">
                      {alertCount}
                    </span>
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>
        {!collapsed && (
          <div className="px-4 py-3 border-t border-slate-border">
            <div className="text-[10px] font-mono text-slate-dim">
              {now.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
            </div>
            <div className="text-[10px] font-mono text-slate-dim mt-0.5">
              System: <span className="text-green-400">ONLINE</span>
            </div>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-[72px] w-6 h-6 rounded-full bg-navy-700 border border-slate-border
            flex items-center justify-center text-slate-text hover:text-cyan-400 hover:border-cyan-500/40 transition-all z-10"
        >
          {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
        </button>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="flex items-center justify-between px-6 py-3 bg-navy-900/80 border-b border-slate-border backdrop-blur-sm flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full status-dot-active"></div>
            <span className="text-xs font-mono text-slate-text">WebSocket Connected</span>
          </div>
          <div className="flex items-center gap-4">
            {alertCount > 0 && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/30">
                <Bell size={12} className="text-red-400 animate-pulse" />
                <span className="text-xs font-mono text-red-400">{alertCount} Active Alert{alertCount > 1 ? 's' : ''}</span>
              </div>
            )}
            <div className="text-xs font-mono text-slate-dim">
              {now.toLocaleTimeString('en-IN', { hour12: false })} IST
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto dot-grid">
          {children}
        </main>
      </div>
    </div>
  )
}
