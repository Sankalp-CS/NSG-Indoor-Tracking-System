const BASE = '/api'

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(text || `HTTP ${res.status}`)
  }
  const text = await res.text()
  return text ? JSON.parse(text) : null
}

export const getSoldiers        = () => request('/soldiers')
export const createSoldier      = (d) => request('/soldiers', { method: 'POST', body: JSON.stringify(d) })
export const deleteSoldier      = (id) => request(`/soldiers/${id}`, { method: 'DELETE' })

export const getBuildings       = () => request('/buildings')
export const createBuilding     = (d) => request('/buildings', { method: 'POST', body: JSON.stringify(d) })

export const getAllLatestLocations = () => request('/location/all')
export const getLocationHistory   = (id) => request(`/location/history/${id}`)
export const updateLocation       = (d) => request('/location/update', { method: 'POST', body: JSON.stringify(d) })

export const getActiveAlerts      = () => request('/alerts/active')
export const sendCommanderMessage = (id, message) =>
  request(`/alerts/${id}/message`, { method: 'POST', body: JSON.stringify({ message }) })
export const getRedZones          = () => request('/alerts/redzone')
export const createRedZone        = (d) => request('/alerts/redzone', { method: 'POST', body: JSON.stringify(d) })
export const deleteRedZone        = (id) => request(`/alerts/redzone/${id}`, { method: 'DELETE' })

export const getOperations        = () => request('/operations')
export const getActiveOperations  = () => request('/operations/active')
export const createOperation      = (d) => request('/operations', { method: 'POST', body: JSON.stringify(d) })
export const updateOperationStatus= (id, status) =>
  request(`/operations/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) })
export const deleteOperation      = (id) => request(`/operations/${id}`, { method: 'DELETE' })
