import React from 'react'
import { TrendingUp, Users, Waves } from 'lucide-react'
import { useDashboard } from '../../context/DashboardContext'
import { yearlyStats, formatVisitors } from '../../data/simrishamnData'
import { PRESSURE_COLORS, ORANGE, CYAN } from '../../theme/colors'
import { SectionLabel } from './ui'

// ── SVG arc gauge for Overtourism Index ──────────────────────────
function OvertourismGauge({ value }) {
  const r     = 26
  const circ  = 2 * Math.PI * r
  const offset = circ * (1 - Math.min(value, 100) / 100)

  const [color, label] =
    value < 35 ? [PRESSURE_COLORS.low,      'Low']      :
    value < 55 ? [PRESSURE_COLORS.medium,   'Moderate'] :
    value < 75 ? [PRESSURE_COLORS.high,     'High']     :
                 [PRESSURE_COLORS.critical, 'Critical']

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

// ── Main component ────────────────────────────────────────────────
export default function StatsPanel() {
  const { selectedYear } = useDashboard()
  const stats = yearlyStats[selectedYear]

  return (
    <div>
      <SectionLabel>
        <span className="inline-flex items-center gap-1.5">
          <TrendingUp size={10} /> Snapshot {selectedYear}
        </span>
      </SectionLabel>

      <div className="grid grid-cols-2 gap-2 mb-3">
        <div className="bg-dash-700 rounded-xl p-2.5">
          <div className="flex items-center gap-1.5 mb-0.5">
            <Users size={11} style={{ color: CYAN }} />
            <span className="text-[10px] text-slate-500">Total</span>
          </div>
          <div className="text-base font-bold text-white">{formatVisitors(stats.total)}</div>
        </div>
        <div className="bg-dash-700 rounded-xl p-2.5">
          <div className="flex items-center gap-1.5 mb-0.5">
            <Waves size={11} style={{ color: ORANGE }} />
            <span className="text-[10px] text-slate-500">Avg Stay</span>
          </div>
          <div className="text-base font-bold text-white">{stats.avgStay}d</div>
        </div>
      </div>

      <OvertourismGauge value={stats.overtourismIndex} />
    </div>
  )
}
