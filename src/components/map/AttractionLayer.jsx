import React from 'react'
import { Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import { useDashboard } from '../../context/DashboardContext'
import { getFilteredAttractions, TOURISM_TYPES, formatVisitors } from '../../data/simrishamnData'
import { TYPE_COLORS, PRESSURE_COLORS } from '../../theme/colors'

// ── Diamond-shaped marker icon ────────────────────────────────────
function createIcon(type, pressureLevel, isSelected) {
  const fillColor = TYPE_COLORS[type] || '#94A3B8'
  const ringColor = PRESSURE_COLORS[pressureLevel] || '#94A3B8'
  const typeObj   = TOURISM_TYPES.find(t => t.id === type)
  const size      = isSelected ? 38 : 30
  const half      = size / 2

  return L.divIcon({
    className: '',
    html: `
      <div style="
        width:${size}px; height:${size}px;
        background:${fillColor};
        border:3px solid ${ringColor};
        border-radius:50% 50% 50% 4px;
        transform:rotate(-45deg);
        box-shadow:0 4px 14px rgba(0,0,0,0.6),
                   0 0 0 ${isSelected ? '4px' : '0px'} ${fillColor}66;
        display:flex; align-items:center; justify-content:center;
        transition:all 0.2s;
      ">
        <span style="transform:rotate(45deg);font-size:${isSelected ? 16 : 13}px;line-height:1;user-select:none;">
          ${typeObj?.icon || '📍'}
        </span>
      </div>`,
    iconSize:    [size, size],
    iconAnchor:  [half - 2, size],
    popupAnchor: [0, -size],
  })
}

// ── Popup card ────────────────────────────────────────────────────
function AttractionPopup({ a, year }) {
  const v      = a.visitors[year] ?? 0
  const pct    = Math.round((v / 365 / a.capacityPerDay) * 100)
  const pColor = PRESSURE_COLORS[a.pressureLevel]
  const icon   = TOURISM_TYPES.find(t => t.id === a.type)?.icon || '📍'

  return (
    <div style={{ minWidth: 200 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
        <span style={{ fontSize: 22 }}>{icon}</span>
        <div>
          <div style={{ fontWeight: 700, fontSize: 13 }}>{a.name}</div>
          <div style={{ fontSize: 10, color: '#94A3B8' }}>{a.area}</div>
        </div>
      </div>
      <div style={{ fontSize: 11, color: '#CBD5E1', marginBottom: 8, lineHeight: 1.5 }}>
        {a.description}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 12px', fontSize: 11 }}>
        <div>
          <div style={{ color: '#64748B' }}>Visitors {year}</div>
          <div style={{ fontWeight: 600, color: '#F1F5F9' }}>{formatVisitors(v)}</div>
        </div>
        <div>
          <div style={{ color: '#64748B' }}>Capacity use</div>
          <div style={{ fontWeight: 600, color: pct > 80 ? '#C8102E' : '#F1F5F9' }}>{pct}%</div>
        </div>
        <div>
          <div style={{ color: '#64748B' }}>Rating</div>
          <div style={{ fontWeight: 600, color: '#FFCD00' }}>★ {a.rating}</div>
        </div>
        <div>
          <div style={{ color: '#64748B' }}>Pressure</div>
          <div style={{ fontWeight: 700, color: pColor, textTransform: 'capitalize' }}>
            {a.pressureLevel}
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Layer component ───────────────────────────────────────────────
export default function AttractionLayer() {
  const { selectedYear, selectedTypes, selectedAttraction, setSelectedAttraction } = useDashboard()
  const filtered = getFilteredAttractions(selectedTypes)

  return filtered.map(a => {
    const isSelected = selectedAttraction === a.id
    return (
      <Marker
        key={a.id}
        position={a.coords}
        icon={createIcon(a.type, a.pressureLevel, isSelected)}
        eventHandlers={{ click: () => setSelectedAttraction(a.id) }}
      >
        <Popup>
          <AttractionPopup a={a} year={selectedYear} />
        </Popup>
      </Marker>
    )
  })
}
