import React, { useRef } from 'react'
import {
  Layers, Calendar, Thermometer, Users, TrendingUp,
  Upload, Map, Leaf, Waves, Utensils, PartyPopper,
  Activity, Star,
} from 'lucide-react'
import { useDashboard } from '../context/DashboardContext'
import {
  YEARS, TOURISM_TYPES, SEASONS, PRESSURE_COLORS,
  yearlyStats, formatVisitors, attractions,
} from '../data/simrishamnData'
import { parseGeoJSON } from '../utils/dataLoader'

// ── Reusable sub-components ──────────────────────────────────────

function SectionLabel({ children }) {
  return <p className="section-label">{children}</p>
}

function Divider() {
  return <div className="border-t border-dash-600 my-4" />
}

function Toggle({ checked, onChange, color }) {
  return (
    <button
      onClick={onChange}
      className="relative flex-shrink-0 w-10 h-5 rounded-full transition-colors duration-200 focus:outline-none"
      style={{ backgroundColor: checked ? color || '#FF6B35' : '#2D3A52' }}
      aria-pressed={checked}
    >
      <span
        className="absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-md transition-transform duration-200"
        style={{ transform: checked ? 'translateX(22px)' : 'translateX(2px)' }}
      />
    </button>
  )
}

function OvertourismGauge({ value }) {
  const r   = 26
  const circ = 2 * Math.PI * r
  const offset = circ * (1 - Math.min(value, 100) / 100)
  const color =
    value < 35 ? '#10B981' :
    value < 55 ? '#F59E0B' :
    value < 75 ? '#F97316' : '#EF4444'
  const label =
    value < 35 ? 'Low' :
    value < 55 ? 'Moderate' :
    value < 75 ? 'High' : 'Critical'

  return (
    <div className="flex items-center gap-3">
      <div className="relative flex items-center justify-center w-16 h-16">
        <svg width="64" height="64" className="-rotate-90">
          <circle cx="32" cy="32" r={r} fill="none" stroke="#2D3A52" strokeWidth="5" />
          <circle
            cx="32" cy="32" r={r} fill="none"
            stroke={color} strokeWidth="5"
            strokeDasharray={circ}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 0.6s ease, stroke 0.3s' }}
          />
        </svg>
        <div className="absolute text-center leading-none">
          <div className="text-base font-bold" style={{ color }}>{value}</div>
          <div className="text-[9px] text-slate-500 uppercase tracking-wide">OTI</div>
        </div>
      </div>
      <div>
        <div className="text-xs font-semibold" style={{ color }}>{label}</div>
        <div className="text-[10px] text-slate-500 leading-tight">Overtourism<br />Index</div>
      </div>
    </div>
  )
}

// ── Layer row ────────────────────────────────────────────────────

const LAYER_DEFS = [
  { key: 'attractions',     label: 'Attractions',       color: '#F59E0B', icon: Map       },
  { key: 'heatmap',         label: 'Visitor Heatmap',   color: '#EF4444', icon: Thermometer },
  { key: 'overtourism',     label: 'Pressure Zones',    color: '#F97316', icon: Activity  },
  { key: 'clusters',        label: 'Cluster View',      color: '#06B6D4', icon: Layers    },
  { key: 'uploadedGeoJSON', label: 'Imported Layer',    color: '#8B5CF6', icon: Upload    },
]

// ── Sidebar ──────────────────────────────────────────────────────

export default function Sidebar() {
  const {
    selectedYear,    setSelectedYear,
    selectedSeason,  setSelectedSeason,
    selectedTypes,   toggleType,
    activeLayers,    toggleLayer,
    addUploadedLayer,
  } = useDashboard()

  const stats = yearlyStats[selectedYear]
  const prevStats = yearlyStats[selectedYear - 1]
  const growthPct = prevStats
    ? (((stats.total - prevStats.total) / prevStats.total) * 100).toFixed(1)
    : null

  const fileRef = useRef(null)

  async function handleFileUpload(e) {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const geo = await parseGeoJSON(file)
      addUploadedLayer({ name: file.name, data: geo })
      toggleLayer('uploadedGeoJSON')
    } catch {
      alert('Could not parse file. Please use GeoJSON format.\nTo convert: geopandas df.to_file("out.geojson", driver="GeoJSON")')
    }
  }

  return (
    <aside className="w-72 flex-shrink-0 flex flex-col bg-dash-800 border-r border-dash-600 overflow-y-auto">
      {/* ── Header ──────────────────────────── */}
      <div
        className="flex-shrink-0 p-4 pb-5"
        style={{
          background: 'linear-gradient(135deg, #FF6B35 0%, #F59E0B 45%, #06B6D4 100%)',
        }}
      >
        <div className="flex items-center gap-3">
          <div className="text-3xl select-none">⛵</div>
          <div>
            <div className="font-bold text-white tracking-[0.12em] text-sm uppercase leading-tight">
              Simrishamn
            </div>
            <div className="text-white/75 text-[11px] leading-tight">
              Tourism Analytics · Skåne
            </div>
          </div>
        </div>
        <div className="mt-3 flex items-center gap-2">
          <div
            className="text-xs font-semibold text-white/90 bg-white/20 rounded-full px-3 py-0.5 backdrop-blur-sm"
          >
            {selectedYear}
          </div>
          {growthPct && (
            <div className={`text-xs font-semibold rounded-full px-2 py-0.5 backdrop-blur-sm ${
              Number(growthPct) >= 0
                ? 'bg-emerald-400/20 text-emerald-200'
                : 'bg-red-400/20 text-red-200'
            }`}>
              {Number(growthPct) >= 0 ? '▲' : '▼'} {Math.abs(growthPct)}%
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 p-4 space-y-1">
        {/* ── Year Slider ─────────────────────── */}
        <div className="panel-card">
          <SectionLabel>
            <span className="inline-flex items-center gap-1.5">
              <Calendar size={10} /> Year Filter
            </span>
          </SectionLabel>
          <div className="flex justify-between text-[10px] text-slate-500 mb-1 px-0.5">
            {YEARS.map(y => (
              <span
                key={y}
                className={`transition-colors ${y === selectedYear ? 'text-tourism-orange font-bold' : ''}`}
              >
                {y}
              </span>
            ))}
          </div>
          <input
            type="range"
            min={YEARS[0]}
            max={YEARS[YEARS.length - 1]}
            step={1}
            value={selectedYear}
            onChange={e => setSelectedYear(Number(e.target.value))}
            className="w-full"
          />
        </div>

        <Divider />

        {/* ── Data Layers ─────────────────────── */}
        <div>
          <SectionLabel>
            <span className="inline-flex items-center gap-1.5">
              <Layers size={10} /> Data Layers
            </span>
          </SectionLabel>
          <div className="space-y-2.5">
            {LAYER_DEFS.map(({ key, label, color, icon: Icon }) => (
              <div key={key} className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Icon size={13} style={{ color }} />
                  <span className="text-xs text-slate-300">{label}</span>
                </div>
                <Toggle
                  checked={activeLayers[key]}
                  onChange={() => toggleLayer(key)}
                  color={color}
                />
              </div>
            ))}
          </div>
        </div>

        <Divider />

        {/* ── Tourism Types ───────────────────── */}
        <div>
          <SectionLabel>
            <span className="inline-flex items-center gap-1.5">
              <Star size={10} /> Tourism Types
            </span>
          </SectionLabel>
          <div className="space-y-2">
            {TOURISM_TYPES.map(({ id, label, color, icon }) => {
              const active = selectedTypes.includes(id)
              return (
                <button
                  key={id}
                  onClick={() => toggleType(id)}
                  className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg transition-all ${
                    active ? 'bg-dash-700' : 'opacity-40'
                  }`}
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0 transition-all"
                    style={{ backgroundColor: active ? color : '#475569' }}
                  />
                  <span className="text-xs text-slate-300 text-left flex-1">{label}</span>
                  <span className="text-sm select-none">{icon}</span>
                </button>
              )
            })}
          </div>
        </div>

        <Divider />

        {/* ── Season Filter ───────────────────── */}
        <div>
          <SectionLabel>
            <span className="inline-flex items-center gap-1.5">
              <Leaf size={10} /> Season
            </span>
          </SectionLabel>
          <div className="grid grid-cols-2 gap-1.5">
            {SEASONS.map(s => (
              <button
                key={s.id}
                onClick={() => setSelectedSeason(s.id)}
                className={`text-xs py-1.5 rounded-lg transition-all font-medium ${
                  selectedSeason === s.id
                    ? 'bg-tourism-orange text-white shadow-lg shadow-tourism-orange/25'
                    : 'bg-dash-700 text-slate-400 hover:bg-dash-600 hover:text-slate-200'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        <Divider />

        {/* ── Stats ───────────────────────────── */}
        <div>
          <SectionLabel>
            <span className="inline-flex items-center gap-1.5">
              <TrendingUp size={10} /> Snapshot {selectedYear}
            </span>
          </SectionLabel>
          <div className="grid grid-cols-2 gap-2 mb-3">
            <div className="bg-dash-700 rounded-xl p-2.5">
              <div className="flex items-center gap-1.5 mb-0.5">
                <Users size={11} className="text-tourism-cyan" />
                <span className="text-[10px] text-slate-500">Total</span>
              </div>
              <div className="text-base font-bold text-white">
                {formatVisitors(stats.total)}
              </div>
            </div>
            <div className="bg-dash-700 rounded-xl p-2.5">
              <div className="flex items-center gap-1.5 mb-0.5">
                <Waves size={11} className="text-tourism-amber" />
                <span className="text-[10px] text-slate-500">Avg Stay</span>
              </div>
              <div className="text-base font-bold text-white">
                {stats.avgStay}d
              </div>
            </div>
          </div>
          <OvertourismGauge value={stats.overtourismIndex} />
        </div>

        <Divider />

        {/* ── Import ──────────────────────────── */}
        <div>
          <SectionLabel>
            <span className="inline-flex items-center gap-1.5">
              <Upload size={10} /> Import Spatial Data
            </span>
          </SectionLabel>
          <input
            ref={fileRef}
            type="file"
            accept=".geojson,.json"
            className="hidden"
            onChange={handleFileUpload}
          />
          <button
            onClick={() => fileRef.current?.click()}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-dashed border-dash-500 text-slate-400 text-xs hover:border-tourism-violet hover:text-tourism-violet hover:bg-tourism-violet/5 transition-all"
          >
            <Upload size={13} />
            Load GeoJSON / GeoPackage
          </button>
          <p className="text-[10px] text-slate-600 mt-1.5 leading-relaxed">
            Convert .gpkg → GeoJSON with geopandas:<br />
            <code className="text-slate-500">df.to_file("out.geojson")</code>
          </p>
        </div>
      </div>
    </aside>
  )
}
