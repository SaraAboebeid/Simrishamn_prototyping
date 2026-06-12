import React from 'react'
import { GeoJSON } from 'react-leaflet'
import { useDashboard } from '../../context/DashboardContext'

export default function TouristDesoLayer() {
  const { touristDesoData } = useDashboard()
  if (!touristDesoData) return null

  return (
    <GeoJSON
      key={touristDesoData.features?.length ?? 0}
      data={touristDesoData}
      style={{
        color:       '#A78BFA',
        fillColor:   '#A78BFA',
        fillOpacity: 0.18,
        weight:      1,
      }}
      onEachFeature={(feature, layer) => {
        const p = feature.properties ?? {}
        layer.bindPopup(`
          <div style="font-size:11px;min-width:140px">
            <div style="font-weight:700;margin-bottom:4px;color:#A78BFA">Home Area</div>
            <div>DeSO: ${p.desokod_home ?? '—'}</div>
            <div>Municipality: ${p.kommunnamn_home ?? '—'}</div>
          </div>
        `)
      }}
    />
  )
}
