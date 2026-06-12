import React from 'react'
import { GeoJSON } from 'react-leaflet'
import L from 'leaflet'
import { useDashboard } from '../../context/DashboardContext'

export default function TouristStopsLayer() {
  const { touristStopsData } = useDashboard()
  if (!touristStopsData) return null

  return (
    <GeoJSON
      key={touristStopsData.features?.length ?? 0}
      data={touristStopsData}
      pointToLayer={(_feature, latlng) =>
        L.circleMarker(latlng, {
          radius:      4,
          fillColor:   '#EC4899',
          color:       '#EC4899',
          weight:      0.5,
          opacity:     0.8,
          fillOpacity: 0.5,
        })
      }
      onEachFeature={(feature, layer) => {
        const p = feature.properties ?? {}
        layer.bindPopup(`
          <div style="font-size:11px;min-width:140px">
            <div style="font-weight:700;margin-bottom:4px;color:#EC4899">Tourist Stop</div>
            <div>Duration: ${p.duration ?? '—'}</div>
            <div>Start: ${p.start_time ?? '—'}</div>
            <div>End: ${p.end_time ?? '—'}</div>
          </div>
        `)
      }}
    />
  )
}
