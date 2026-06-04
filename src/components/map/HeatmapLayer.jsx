import React, { useMemo } from 'react'
import { Circle } from 'react-leaflet'
import { useDashboard } from '../../context/DashboardContext'
import { getHeatmapData } from '../../data/simrishamnData'

// Skåne-flag heat ramp: blue (cool/low) → teal → gold → red (hot/critical)
function heatColor(t) {
  if (t < 0.25) return '#4169C8'  // Skåne blue
  if (t < 0.5)  return '#0EA5B0'  // teal
  if (t < 0.75) return '#FFCD00'  // Skåne gold
  return '#C8102E'                 // Skåne red
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
