import React, { useMemo } from 'react'
import { Circle } from 'react-leaflet'
import { useDashboard } from '../../context/DashboardContext'

const GRID_SIZE_DEG = 0.0015 // ~150-170m in this latitude band
const SIMRISHAMN_HEAT_BOUNDS = {
  minLat: 55.52,
  maxLat: 55.59,
  minLon: 14.31,
  maxLon: 14.39,
}

// Summer heat ramp: cyan (cool/low) → emerald → amber → red (hot/critical)
function heatColor(t) {
  if (t < 0.25) return '#06B6D4'  // cyan — low density
  if (t < 0.5)  return '#10B981'  // emerald — moderate
  if (t < 0.75) return '#F59E0B'  // amber — high
  return '#EF4444'                 // red — critical
}

export default function HeatmapLayer() {
  const { filteredVisits } = useDashboard()

  // Aggregate to fine grid cells and use log scaling for stable hotspot contrast.
  const cells = useMemo(() => {
    const grid = {}

    const roundToGrid = (value) =>
      Math.round(value / GRID_SIZE_DEG) * GRID_SIZE_DEG

    filteredVisits.forEach(v => {
      if (
        v.lat < SIMRISHAMN_HEAT_BOUNDS.minLat || v.lat > SIMRISHAMN_HEAT_BOUNDS.maxLat ||
        v.lon < SIMRISHAMN_HEAT_BOUNDS.minLon || v.lon > SIMRISHAMN_HEAT_BOUNDS.maxLon
      ) return

      const lon = roundToGrid(v.lon)
      const lat = roundToGrid(v.lat)
      const key = `${lon.toFixed(4)},${lat.toFixed(4)}`
      grid[key] = (grid[key] || 0) + 1
    })

    const entries = Object.entries(grid)
    const max = Math.max(...entries.map(([, c]) => c), 1)

    return entries.map(([key, count]) => {
      const [lon, lat] = key.split(',').map(Number)
      const intensity = Math.log1p(count) / Math.log1p(max)
      return { lat, lon, intensity }
    })
  }, [filteredVisits])

  return cells.map(({ lat, lon, intensity }, i) => (
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
    </Circle>
  ))
}
