import React, { useMemo } from 'react'
import { Rectangle, Popup } from 'react-leaflet'
import { useDashboard } from '../../context/DashboardContext'
import { PRESSURE_COLORS } from '../../theme/colors'

// Grid resolution: ~300 m cells (pressure zones are coarser than the heatmap)
const GRID_DEG = 0.003

function pressureLevel(intensity) {
  if (intensity < 0.35) return 'low'
  if (intensity < 0.60) return 'medium'
  if (intensity < 0.80) return 'high'
  return 'critical'
}

// Keep only the top N% densest cells so the layer stays readable
const SHOW_TOP_PERCENTILE = 0.25

export default function OvertourismLayer() {
  const { touristStopsData } = useDashboard()

  const zones = useMemo(() => {
    if (!touristStopsData?.features) return []

    const grid = {}
    touristStopsData.features.forEach(f => {
      if (f.geometry?.type !== 'Point') return
      const [flon, flat] = f.geometry.coordinates
      const lon = Math.round(flon / GRID_DEG) * GRID_DEG
      const lat = Math.round(flat / GRID_DEG) * GRID_DEG
      const key = `${lon.toFixed(4)},${lat.toFixed(4)}`
      if (!grid[key]) grid[key] = { lon, lat, count: 0, devices: new Set() }
      grid[key].count++
      grid[key].devices.add(f.properties?.device_uid)
    })

    const cells = Object.values(grid)
    if (!cells.length) return []

    const counts = cells.map(c => c.count).sort((a, b) => a - b)
    const threshold = counts[Math.floor(counts.length * (1 - SHOW_TOP_PERCENTILE))]
    const maxCount = counts[counts.length - 1]

    return cells
      .filter(c => c.count >= threshold)
      .map(c => {
        const intensity = Math.log1p(c.count) / Math.log1p(maxCount)
        const level = pressureLevel(intensity)
        return {
          key: `${c.lon.toFixed(4)},${c.lat.toFixed(4)}`,
          bounds: [
            [c.lat - GRID_DEG / 2, c.lon - GRID_DEG / 2],
            [c.lat + GRID_DEG / 2, c.lon + GRID_DEG / 2],
          ],
          count: c.count,
          devices: c.devices.size,
          level,
          intensity,
        }
      })
  }, [touristStopsData])

  return zones.map(zone => {
    const color = PRESSURE_COLORS[zone.level]
    return (
      <Rectangle
        key={zone.key}
        bounds={zone.bounds}
        pathOptions={{
          color,
          fillColor:   color,
          fillOpacity: 0.15 + zone.intensity * 0.25,
          weight:      1,
          dashArray:   '4 3',
        }}
      >
        <Popup>
          <div style={{ minWidth: 160 }}>
            <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 4 }}>Pressure Zone</div>
            <div style={{ fontSize: 11, color: '#CBD5E1', marginBottom: 2 }}>{zone.count} stops in cell</div>
            <div style={{ fontSize: 11, color: '#CBD5E1', marginBottom: 6 }}>{zone.devices} unique devices</div>
            <span style={{
              fontSize: 10, fontWeight: 700,
              color, textTransform: 'uppercase', letterSpacing: '0.08em',
            }}>
              {zone.level} pressure
            </span>
          </div>
        </Popup>
      </Rectangle>
    )
  })
}

