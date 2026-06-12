import React, { useMemo } from 'react'
import { Rectangle, Tooltip, Popup } from 'react-leaflet'
import { useDashboard } from '../../context/DashboardContext'

const GRID_SIZE_DEG = 0.003 // ~300m cells for cluster aggregation

export default function ClusterLayer() {
  const { touristStopsData } = useDashboard()

  const clusters = useMemo(() => {
    if (!touristStopsData?.features) return []
    const cells = {}

    const roundToGrid = (value) =>
      Math.round(value / GRID_SIZE_DEG) * GRID_SIZE_DEG

    touristStopsData.features.forEach(f => {
      if (f.geometry?.type !== 'Point') return
      const [flon, flat] = f.geometry.coordinates
      const lon = roundToGrid(flon)
      const lat = roundToGrid(flat)
      const key = `${lon.toFixed(4)},${lat.toFixed(4)}`
      if (!cells[key]) cells[key] = { lon, lat, count: 0 }
      cells[key].count++
    })

    const values = Object.values(cells)
    const maxCount = Math.max(...values.map(c => c.count), 1)

    return values
      .map(c => ({
        ...c,
        intensity: Math.log1p(c.count) / Math.log1p(maxCount),
        bounds: [
          [c.lat - GRID_SIZE_DEG / 2, c.lon - GRID_SIZE_DEG / 2],
          [c.lat + GRID_SIZE_DEG / 2, c.lon + GRID_SIZE_DEG / 2],
        ],
      }))
      .sort((a, b) => b.count - a.count)
  }, [touristStopsData])

  return clusters.map((c, i) => (
    <Rectangle
      key={`cluster-${i}`}
      bounds={c.bounds}
      pathOptions={{
        color:       '#38BDF8',
        weight:      0.5,
        fillColor:   '#06B6D4',
        fillOpacity: 0.15 + c.intensity * 0.6,
      }}
    >
      <Tooltip direction="top" sticky>
        <div style={{ minWidth: 120 }}>
          <div style={{ fontWeight: 700, fontSize: 12, marginBottom: 3 }}>Visit cluster</div>
          <div style={{ fontSize: 11, color: '#CBD5E1' }}>{c.count} stops in cell</div>
        </div>
      </Tooltip>
      <Popup>
        <div style={{ minWidth: 130 }}>
          <div style={{ fontWeight: 700, fontSize: 12, marginBottom: 4 }}>Visit cluster</div>
          <div style={{ fontSize: 11, color: '#CBD5E1' }}>{c.count} stops in cell</div>
          <div style={{ fontSize: 10, color: '#64748B', marginTop: 2 }}>
            {c.lat.toFixed(4)}N, {c.lon.toFixed(4)}E
          </div>
        </div>
      </Popup>
    </Rectangle>
  ))
}

