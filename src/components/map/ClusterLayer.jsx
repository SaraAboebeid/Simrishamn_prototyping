import React, { useMemo } from 'react'
import { CircleMarker, Popup, Tooltip } from 'react-leaflet'
import { useDashboard } from '../../context/DashboardContext'

const GRID_SIZE_DEG = 0.003 // ~300m cells for cluster aggregation

export default function ClusterLayer() {
  const { filteredVisits } = useDashboard()

  const clusters = useMemo(() => {
    const cells = {}

    const roundToGrid = (value) =>
      Math.round(value / GRID_SIZE_DEG) * GRID_SIZE_DEG

    filteredVisits.forEach(v => {
      const lon = roundToGrid(v.lon)
      const lat = roundToGrid(v.lat)
      const key = `${lon.toFixed(4)},${lat.toFixed(4)}`
      if (!cells[key]) cells[key] = { lon, lat, count: 0 }
      cells[key].count++
    })

    const values = Object.values(cells)
    const maxCount = Math.max(...values.map(c => c.count), 1)

    return values
      .map(c => ({
        ...c,
        intensity: c.count / maxCount,
      }))
      .sort((a, b) => b.count - a.count)
  }, [filteredVisits])

  return clusters.map((c, i) => {
    const radius = 3 + c.intensity * 11

    return (
      <CircleMarker
        key={`cluster-${i}`}
        center={[c.lat, c.lon]}
        radius={radius}
        pathOptions={{
          color: '#38BDF8',
          weight: 1,
          fillColor: '#06B6D4',
          fillOpacity: 0.2 + c.intensity * 0.55,
        }}
      >
        <Tooltip direction="top" sticky>
          <div style={{ minWidth: 120 }}>
            <div style={{ fontWeight: 700, fontSize: 12, marginBottom: 3 }}>Visit cluster</div>
            <div style={{ fontSize: 11, color: '#CBD5E1' }}>{c.count} visits</div>
          </div>
        </Tooltip>
        <Popup>
          <div style={{ minWidth: 130 }}>
            <div style={{ fontWeight: 700, fontSize: 12, marginBottom: 4 }}>Visit cluster</div>
            <div style={{ fontSize: 11, color: '#CBD5E1' }}>{c.count} visits</div>
            <div style={{ fontSize: 10, color: '#64748B', marginTop: 2 }}>
              {c.lat.toFixed(4)}N, {c.lon.toFixed(4)}E
            </div>
          </div>
        </Popup>
      </CircleMarker>
    )
  })
}
