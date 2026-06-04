import React from 'react'
import { PRESSURE_COLORS } from '../../theme/colors'

export default function MapLegend() {
  return (
    <div
      style={{
        position: 'absolute', top: 10, right: 10, zIndex: 1000,
        background: 'rgba(25,11,14,0.92)',
        border: '1px solid #2D3A52',
        borderRadius: 10, padding: '8px 12px',
        fontSize: 10, color: '#CBD5E1',
        backdropFilter: 'blur(10px)',
      }}
    >
      <div style={{
        fontWeight: 700, marginBottom: 5,
        color: '#F59E0B',
        letterSpacing: '0.10em', fontSize: 9, textTransform: 'uppercase',
      }}>
        Pressure Level
      </div>
      {Object.entries(PRESSURE_COLORS).map(([lvl, col]) => (
        <div key={lvl} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: col, flexShrink: 0 }} />
          <span style={{ textTransform: 'capitalize' }}>{lvl}</span>
        </div>
      ))}
    </div>
  )
}
