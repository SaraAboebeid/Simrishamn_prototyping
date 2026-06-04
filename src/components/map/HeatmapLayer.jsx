import React, { useMemo } from 'react'
import { Circle } from 'react-leaflet'
import { useDashboard } from '../../context/DashboardContext'
import { getHeatmapData } from '../../data/simrishamnData'

// Summer heat ramp: cyan (cool/low) -> emerald -> amber -> red (hot/critical)
function heatColor(t) {
  if (t < 0.25) return '#06B6D4'  // cyan — Baltic coast
  if (t < 0.5)  return '#10B981'  // emerald — nature
  if (t < 0.75) return '#F59E0B'  // amber — warm
  return '#EF4444'                 // red — critical
}

export default function HeatmapLayer() {
  const { selectedYear } = useDashboard()
  const heatData = useMemo(() => getHeatmapData(selectedYear), [selectedYear])

  return heatData.map(([lat, lng, intensity], i) => (
    <Circle
      key={`h-${i}`}
      center={[lat, lng]}
      radius={intensity * 2800 + 400}
      pathOptions={{
        color:       'transparent',
        fillColor:   heatColor(intensity),
        fillOpacity: intensity * 0.38,
      }}
    />
  ))
}
