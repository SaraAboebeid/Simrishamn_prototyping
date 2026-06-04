import React, { useMemo, useEffect } from 'react'
import {
  MapContainer, TileLayer, Marker, Popup,
  Circle, Polygon, useMap, GeoJSON,
} from 'react-leaflet'
import L from 'leaflet'
import { useDashboard } from '../context/DashboardContext'
import {
  attractions, overtourismZones, getHeatmapData,
  getFilteredAttractions, TOURISM_TYPES, PRESSURE_COLORS, formatVisitors,
} from '../data/simrishamnData'

// ── Fix Leaflet default icon (Vite asset handling) ───────────────
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconUrl:       new URL('leaflet/dist/images/marker-icon.png',    import.meta.url).href,
  iconRetinaUrl: new URL('leaflet/dist/images/marker-icon-2x.png', import.meta.url).href,
  shadowUrl:     new URL('leaflet/dist/images/marker-shadow.png',  import.meta.url).href,
})

// ── Custom DivIcon per attraction type ───────────────────────────
function createAttractionIcon(type, pressureLevel, isSelected) {
  const typeObj = TOURISM_TYPES.find(t => t.id === type)
  const fillColor  = typeObj?.color || '#94A3B8'
  const ringColor  = PRESSURE_COLORS[pressureLevel] || '#94A3B8'
  const size = isSelected ? 38 : 30
  const half = size / 2

  return L.divIcon({
    className: '',
    html: `
      <div style="
        width:${size}px; height:${size}px;
        background:${fillColor};
        border: 3px solid ${ringColor};
        border-radius: 50% 50% 50% 4px;
        transform: rotate(-45deg);
        box-shadow: 0 4px 14px rgba(0,0,0,0.55), 0 0 0 ${isSelected ? '4px' : '0px'} ${fillColor}55;
        transition: all 0.2s;
        display:flex; align-items:center; justify-content:center;
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

// ── Heatmap colour ramp: cyan → green → amber → red ─────────────
function heatColor(t) {
  if (t < 0.25) return '#06B6D4'
  if (t < 0.5)  return '#10B981'
  if (t < 0.75) return '#F59E0B'
  return '#EF4444'
}

// ── Component that auto-fits bounds on year change ───────────────
function FitBounds({ coords }) {
  const map = useMap()
  useEffect(() => {
    if (coords.length) map.fitBounds(L.latLngBounds(coords), { padding: [40, 40] })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps
  return null
}

// ── Popup content ────────────────────────────────────────────────
function AttractionPopup({ a, year }) {
  const v = a.visitors[year] ?? 0
  const cap = a.capacityPerDay
  const pct = Math.round((v / 365 / cap) * 100)
  const pColor = PRESSURE_COLORS[a.pressureLevel]

  return (
    <div style={{ minWidth: 200 }}>
      <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:6 }}>
        <span style={{ fontSize:22 }}>
          {TOURISM_TYPES.find(t => t.id === a.type)?.icon || '📍'}
        </span>
        <div>
          <div style={{ fontWeight:700, fontSize:13 }}>{a.name}</div>
          <div style={{ fontSize:10, color:'#94A3B8' }}>{a.area}</div>
        </div>
      </div>
      <div style={{ fontSize:11, color:'#CBD5E1', marginBottom:8, lineHeight:1.5 }}>
        {a.description}
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'6px 12px', fontSize:11 }}>
        <div>
          <div style={{ color:'#64748B' }}>Visitors {year}</div>
          <div style={{ fontWeight:600, color:'#F1F5F9' }}>{formatVisitors(v)}</div>
        </div>
        <div>
          <div style={{ color:'#64748B' }}>Capacity use</div>
          <div style={{ fontWeight:600, color: pct > 80 ? '#EF4444' : '#F1F5F9' }}>{pct}%</div>
        </div>
        <div>
          <div style={{ color:'#64748B' }}>Rating</div>
          <div style={{ fontWeight:600, color:'#F59E0B' }}>★ {a.rating}</div>
        </div>
        <div>
          <div style={{ color:'#64748B' }}>Pressure</div>
          <div style={{ fontWeight:700, color: pColor, textTransform:'capitalize' }}>
            {a.pressureLevel}
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Main MapView ─────────────────────────────────────────────────
export default function MapView() {
  const {
    selectedYear, activeLayers, selectedTypes,
    selectedAttraction, setSelectedAttraction, uploadedLayers,
  } = useDashboard()

  const filtered = useMemo(
    () => getFilteredAttractions(selectedTypes),
    [selectedTypes]
  )

  const heatData = useMemo(
    () => activeLayers.heatmap ? getHeatmapData(selectedYear) : [],
    [activeLayers.heatmap, selectedYear]
  )

  const allCoords = attractions.map(a => a.coords)

  return (
    <div style={{ height: '100%', width: '100%', position: 'relative' }}>
      {/* Map legend (top-right) */}
      <div
        style={{
          position:'absolute', top:10, right:10, zIndex:1000,
          background:'rgba(13,17,23,0.88)',
          border:'1px solid #2D3A52',
          borderRadius:10, padding:'8px 12px',
          fontSize:10, color:'#CBD5E1',
          backdropFilter:'blur(8px)',
        }}
      >
        <div style={{ fontWeight:700, marginBottom:5, color:'#F1F5F9', letterSpacing:'0.08em', fontSize:9, textTransform:'uppercase' }}>
          Pressure Level
        </div>
        {Object.entries(PRESSURE_COLORS).map(([lvl, col]) => (
          <div key={lvl} style={{ display:'flex', alignItems:'center', gap:6, marginBottom:3 }}>
            <div style={{ width:8, height:8, borderRadius:'50%', background:col, flexShrink:0 }} />
            <span style={{ textTransform:'capitalize' }}>{lvl}</span>
          </div>
        ))}
      </div>

      <MapContainer
        center={[55.56, 14.22]}
        zoom={11}
        style={{ height: '100%', width: '100%' }}
        zoomControl={false}
      >
        {/* Dark CartoDB base (uses OSM data) */}
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          maxZoom={19}
        />

        <FitBounds coords={allCoords} />

        {/* ── Heatmap circles ─────────────────── */}
        {heatData.map(([lat, lng, intensity], i) => (
          <Circle
            key={`h-${i}`}
            center={[lat, lng]}
            radius={intensity * 2800 + 400}
            pathOptions={{
              color: 'transparent',
              fillColor: heatColor(intensity),
              fillOpacity: intensity * 0.38,
            }}
          />
        ))}

        {/* ── Overtourism pressure zones ──────── */}
        {activeLayers.overtourism && overtourismZones.map(zone => (
          <Polygon
            key={zone.id}
            positions={zone.coords}
            pathOptions={{
              color:       PRESSURE_COLORS[zone.level],
              fillColor:   PRESSURE_COLORS[zone.level],
              fillOpacity: 0.18,
              weight:      1.5,
              dashArray:   '6 4',
            }}
          >
            <Popup>
              <div style={{ minWidth:180 }}>
                <div style={{ fontWeight:700, fontSize:13, marginBottom:4 }}>{zone.name}</div>
                <div style={{ fontSize:11, color:'#CBD5E1', marginBottom:6 }}>{zone.issue}</div>
                <span style={{
                  fontSize:10, fontWeight:700,
                  color: PRESSURE_COLORS[zone.level],
                  textTransform:'uppercase', letterSpacing:'0.08em',
                }}>
                  {zone.level} pressure
                </span>
              </div>
            </Popup>
          </Polygon>
        ))}

        {/* ── Attraction markers ──────────────── */}
        {activeLayers.attractions && filtered.map(a => {
          const isSelected = selectedAttraction === a.id
          return (
            <Marker
              key={a.id}
              position={a.coords}
              icon={createAttractionIcon(a.type, a.pressureLevel, isSelected)}
              eventHandlers={{ click: () => setSelectedAttraction(a.id) }}
            >
              <Popup>
                <AttractionPopup a={a} year={selectedYear} />
              </Popup>
            </Marker>
          )
        })}

        {/* ── Uploaded GeoJSON layers ─────────── */}
        {activeLayers.uploadedGeoJSON && uploadedLayers.map((layer, i) => (
          <GeoJSON
            key={i}
            data={layer.data}
            style={{ color: '#8B5CF6', weight: 2, fillOpacity: 0.15 }}
          />
        ))}
      </MapContainer>
    </div>
  )
}
