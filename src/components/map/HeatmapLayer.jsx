import React, { useMemo } from 'react'
import { Circle } from 'react-leaflet'
import { useDashboard } from '../../context/DashboardContext'

// Summer heat ramp: cyan (cool/low) → emerald → amber → red (hot/critical)
function heatColor(t) {
  if (t < 0.25) return '#06B6D4'  // cyan — low density
  if (t < 0.5)  return '#10B981'  // emerald — moderate
  if (t < 0.75) return '#F59E0B'  // amber — high
  return '#EF4444'                 // red — critical
}

export default function HeatmapLayer() {
  const { filteredVisits } = useDashboard()

  // Aggregate to 0.005° grid cells (~500m) and normalise
  const cells = useMemo(() => {
    const grid = {}
    filteredVisits.forEach(v => {
      const key = `${(Math.round(v.lon * 200) / 200).toFixed(3)},${(Math.round(v.lat * 200) / 200).toFixed(3)}`
      grid[key] = (grid[key] || 0) + 1
    })
    const entries = Object.entries(grid)
    const max = Math.max(...entries.map(([, c]) => c), 1)
    return entries.map(([key, count]) => {
      const [lon, lat] = key.split(',').map(Number)
      return { lat, lon, intensity: count / max, count }
    })
  }, [filteredVisits])

  return cells.map(({ lat, lon, intensity, count }, i) => (
    <Circle
      key={`h-${i}`}
      center={[lat, lon]}
      radius={intensity * 20 + 8}
      pathOptions={{
        color:       'transparent',
        fillColor:   heatColor(intensity),
        fillOpacity: 0.08 + intensity * 0.28,
      }}
    >
    </Circle>
  ))
}
