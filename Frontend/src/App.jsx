import React, { useState, useCallback } from 'react'
import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout.jsx'
import Dashboard   from './pages/Dashboard.jsx'
import Soldiers    from './pages/Soldiers.jsx'
import Buildings   from './pages/Buildings.jsx'
import Operations  from './pages/Operations.jsx'
import RedZones    from './pages/RedZones.jsx'
import LocationSim from './pages/LocationSim.jsx'

export default function App() {
  const [alertCount, setAlertCount] = useState(0)

  return (
    <Layout alertCount={alertCount}>
      <Routes>
        <Route path="/"             element={<Dashboard />}   />
        <Route path="/soldiers"     element={<Soldiers />}    />
        <Route path="/buildings"    element={<Buildings />}   />
        <Route path="/operations"   element={<Operations />}  />
        <Route path="/redzones"     element={<RedZones />}    />
        <Route path="/location-sim" element={<LocationSim />} />
      </Routes>
    </Layout>
  )
}
