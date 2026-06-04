import React from 'react'
import { Polygon, Popup } from 'react-leaflet'
import { overtourismZones } from '../../data/simrishamnData'
import { PRESSURE_COLORS } from '../../theme/colors'

export default function OvertourismLayer() {
  return overtourismZones.map(zone => {
    const color = PRESSURE_COLORS[zone.level]
    return (
      <Polygon
        key={zone.id}
        positions={zone.coords}
        pathOptions={{
          color,
          fillColor:   color,
          fillOpacity: 0.18,
          weight:      1.5,
          dashArray:   '6 4',
        }}
      >
        <Popup>
          <div style={{ minWidth: 180 }}>
            <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 4 }}>{zone.name}</div>
            <div style={{ fontSize: 11, color: '#CBD5E1', marginBottom: 6 }}>{zone.issue}</div>
            <span style={{
              fontSize: 10, fontWeight: 700,
              color, textTransform: 'uppercase', letterSpacing: '0.08em',
            }}>
              {zone.level} pressure
            </span>
          </div>
        </Popup>
      </Polygon>
    )
  })
}
