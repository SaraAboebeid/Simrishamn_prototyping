import React, { useMemo } from 'react'
import { Circle, Tooltip } from 'react-leaflet'
import { useDashboard } from '../../context/DashboardContext'

const GRID_SIZE_DEG = 0.0015 // ~150-170m in this latitude band

// Summer heat ramp: cyan (cool/low) → emerald → amber → red (hot/critical)
function heatColor(t) {
  if (t < 0.25) return '#06B6D4'  // cyan — low density
  if (t < 0.5)  return '#10B981'  // emerald — moderate
  if (t < 0.75) return '#F59E0B'  // amber — high
  return '#EF4444'                 // red — critical
}

function heatLabel(t) {
  if (t < 0.25) return 'Low'
  if (t < 0.5) return 'Moderate'
  if (t < 0.75) return 'High'
  return 'Relative peak'
}

export default function HeatmapLayer() {
  const { filteredVisits } = useDashboard()

  // Aggregate to fine grid cells and use log scaling for stable hotspot contrast.
  const cells = useMemo(() => {
    const grid = {}

    const roundToGrid = (value) =>
      Math.round(value / GRID_SIZE_DEG) * GRID_SIZE_DEG

    filteredVisits.forEach(v => {
      const lon = roundToGrid(v.lon)
      const lat = roundToGrid(v.lat)
      const key = `${lon.toFixed(4)},${lat.toFixed(4)}`
      if (!grid[key]) grid[key] = new Set()
      grid[key].add(v.uid)
    })

    const entries = Object.entries(grid)
    const max = Math.max(...entries.map(([, s]) => s.size), 1)

    return entries.map(([key, set]) => {
      const [lon, lat] = key.split(',').map(Number)
      const count = set.size
      const intensity = Math.log1p(count) / Math.log1p(max)
      return { lat, lon, intensity, count }
    })
  }, [filteredVisits])

  const uniqueVisibleVisitors = useMemo(
    () => new Set(filteredVisits.map(v => v.uid)).size,
    [filteredVisits]
  )

  const maxCellCount = useMemo(
    () => cells.reduce((m, c) => Math.max(m, c.count), 0),
    [cells]
  )

  return cells.map(({ lat, lon, intensity, count }, i) => (
    <Circle
      key={`h-${i}`}
      center={[lat, lon]}
      radius={35 + intensity * 95}
      pathOptions={{
        color:       'transparent',
        fillColor:   heatColor(intensity),
        fillOpacity: 0.14 + intensity * 0.34,
      }}
    >
      <Tooltip direction="top" sticky>
        <div style={{ minWidth: 130 }}>
          <div style={{ fontWeight: 700, fontSize: 12, marginBottom: 3 }}>Heat hotspot</div>
          <div style={{ fontSize: 11, color: '#CBD5E1' }}>{count} visitors in cell</div>
          <div style={{ fontSize: 11, color: '#94A3B8' }}>
            Share: {((count / Math.max(uniqueVisibleVisitors, 1)) * 100).toFixed(2)}% of visible visitors
          </div>
          <div style={{ fontSize: 11, color: '#94A3B8' }}>
            Level: {heatLabel(intensity)} ({count}/{Math.max(maxCellCount, 1)} max)
          </div>
        </div>
      </Tooltip>
    </Circle>
  ))
}
