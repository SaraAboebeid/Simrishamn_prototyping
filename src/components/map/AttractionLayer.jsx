import React, { useMemo } from 'react'
import { Marker, Popup, Circle } from 'react-leaflet'
import L from 'leaflet'
import { useDashboard } from '../../context/DashboardContext'
import { getFilteredAttractions, attractions as ALL_ATTRACTIONS, TOURISM_TYPES, formatVisitors } from '../../data/simrishamnData'
import { countVisitsByNearestAttraction } from '../../data/attractionMatching'
import { TYPE_COLORS, PRESSURE_COLORS } from '../../theme/colors'

const ATTRACTION_MATCH_RADIUS = 0.015

function glowColor(fraction) {
  if (fraction < 0.2)  return '#06B6D4'   // cyan – quiet
  if (fraction < 0.45) return '#4ADE80'   // green – moderate
  if (fraction < 0.7)  return '#F59E0B'   // amber – busy
  return '#EF4444'                         // red – crowded
}

// ── Marker icon sized + coloured by live visitor fraction ─────────
function createIcon(type, fraction, isSelected) {
  const fillColor = TYPE_COLORS[type] || '#94A3B8'
  const typeObj   = TOURISM_TYPES.find(t => t.id === type)
  const ring      = glowColor(fraction)
  const base      = isSelected ? 32 : Math.round(20 + fraction * 10)
  const half      = base / 2

  // Pulse ring behind marker when traffic is notable
  const pulse = fraction > 0.15 ? `
    <div class="attraction-pulse" style="
      position:absolute; inset:-${Math.round(4 + fraction * 8)}px;
      border-radius:50%;
      border:2px solid ${ring};
      opacity:0.6;
      animation:attractionPulse 2.4s ease-out infinite;
    "></div>` : ''

  // Visitor count badge (show only when > 0)
  const countRaw = Math.round(fraction * 100)
  const badge = fraction > 0 ? `
    <div style="
      position:absolute; top:-6px; right:-6px;
      background:${ring}; color:#0D1117;
      font-size:8px; font-weight:700; line-height:1;
      border-radius:8px; padding:2px 4px;
      box-shadow:0 1px 4px rgba(0,0,0,0.5);
      white-space:nowrap;
    ">${countRaw}%</div>` : ''

  return L.divIcon({
    className: '',
    html: `
      <div style="position:relative;width:${base}px;height:${base}px;">
        ${pulse}
        <div style="
          position:absolute; inset:0;
          background:${fillColor};
          border:2.5px solid ${ring};
          border-radius:50% 50% 50% 4px;
          transform:rotate(-45deg);
          box-shadow:0 4px 14px rgba(0,0,0,0.55),0 0 8px ${ring}55;
          display:flex; align-items:center; justify-content:center;
        ">
          <span style="transform:rotate(45deg);font-size:${Math.round(base * 0.45)}px;line-height:1;user-select:none;">
            ${typeObj?.icon || '📍'}
          </span>
        </div>
        ${badge}
      </div>`,
    iconSize:    [base, base],
    iconAnchor:  [half, base],
    popupAnchor: [0, -base],
  })
}

// ── Popup card ────────────────────────────────────────────────────
function AttractionPopup({ a, realVisits }) {
  const pColor = PRESSURE_COLORS[a.pressureLevel]
  const icon   = TOURISM_TYPES.find(t => t.id === a.type)?.icon || '📍'

  return (
    <div style={{ minWidth: 210 }}>
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
          <div style={{ color: '#64748B' }}>GPS visits (filtered)</div>
          <div style={{ fontWeight: 700, color: '#FF6B35' }}>{formatVisitors(realVisits)}</div>
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
  const { selectedTypes, selectedAttraction, setSelectedAttraction, filteredVisits } = useDashboard()
  const filtered = getFilteredAttractions(selectedTypes)

  // Assign each filtered visit to its nearest attraction.
  const visitCounts = useMemo(
    () => countVisitsByNearestAttraction(filteredVisits, ALL_ATTRACTIONS, ATTRACTION_MATCH_RADIUS),
    [filteredVisits]
  )

  const maxCount = useMemo(
    () => Math.max(...Object.values(visitCounts), 1),
    [visitCounts]
  )

  return filtered.map(a => {
    const count    = visitCounts[a.id] ?? 0
    const fraction = count / maxCount
    const isSelected = selectedAttraction === a.id

    return (
      <React.Fragment key={a.id}>
        {/* Soft glow circle showing visitor catchment radius */}
        {count > 0 && (
          <Circle
            center={a.coords}
            radius={45 + fraction * 130}
            pathOptions={{
              color:       glowColor(fraction),
              weight:      1,
              fillColor:   glowColor(fraction),
              fillOpacity: 0.03 + fraction * 0.07,
            }}
          />
        )}
        <Marker
          position={a.coords}
          icon={createIcon(a.type, fraction, isSelected)}
          eventHandlers={{ click: () => setSelectedAttraction(a.id) }}
        >
          <Popup>
            <AttractionPopup a={a} realVisits={count} />
          </Popup>
        </Marker>
      </React.Fragment>
    )
  })
}
