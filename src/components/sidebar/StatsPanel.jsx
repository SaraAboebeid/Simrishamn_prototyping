import React, { useMemo, useState } from 'react'
import { TrendingUp, Clock, BarChart2, Calendar, Info, X } from 'lucide-react'
import { useDashboard } from '../../context/DashboardContext'
import { computeKPIs, computePressureMetrics } from '../../data/visitDataLoader'
import { PRESSURE_COLORS, ORANGE, CYAN } from '../../theme/colors'
import { MONTH_NAMES } from '../../data/swedishCalendar'
import { SectionLabel } from './ui'

// ── SVG arc gauge for Overtourism pressure ───────────────────────
function PressureGauge({ value, pressure }) {
  const [showInfo, setShowInfo] = useState(false)
  const r    = 26
  const circ = 2 * Math.PI * r
  const offset = circ * (1 - Math.min(value, 100) / 100)

  const [color, label] =
    value < 35 ? [PRESSURE_COLORS.low,      'Low']      :
    value < 55 ? [PRESSURE_COLORS.medium,   'Moderate'] :
    value < 75 ? [PRESSURE_COLORS.high,     'High']     :
                 [PRESSURE_COLORS.critical, 'Critical']

  return (
    <div>
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
        <div className="flex-1">
          <div className="flex items-center gap-1.5">
            <div className="text-xs font-semibold" style={{ color }}>{label}</div>
            <button
              onClick={() => setShowInfo(p => !p)}
              className="flex items-center text-slate-500 hover:text-cyan-400 transition-colors"
              title="What is OTI?"
            >
              {showInfo ? <X size={11} /> : <Info size={11} />}
            </button>
          </div>
          <div className="text-[10px] text-slate-500 leading-tight">Overtourism<br />Pressure Index</div>
        </div>
      </div>

      {showInfo && (
        <div className="mt-2 p-2.5 bg-dash-700 rounded-xl border border-dash-600 text-[9px] text-slate-400 space-y-2">
          <p className="text-slate-200 font-semibold text-[10px]">OTI — Overtourism Index (0–100)</p>
          <p className="leading-relaxed">A weighted composite of three GPS-derived signals comparing the current filter period against the full-year baseline.</p>
          <div className="space-y-1.5">
            <div className="flex gap-2">
              <span className="text-cyan-400 font-bold shrink-0">40%</span>
              <span><span className="text-slate-200 font-semibold">Daily Load</span> — avg daily unique visitors vs median daily baseline. Score 100 = 2× typical demand.</span>
            </div>
            <div className="flex gap-2">
              <span className="text-amber-400 font-bold shrink-0">30%</span>
              <span><span className="text-slate-200 font-semibold">Peak-Hour Stress</span> — share of visitors in the busiest hour vs the 95th-percentile baseline peak share.</span>
            </div>
            <div className="flex gap-2">
              <span className="text-rose-400 font-bold shrink-0">30%</span>
              <span><span className="text-slate-200 font-semibold">Hotspot Concentration</span> — fraction of visitors in the top 10% of spatial grid cells vs the baseline concentration.</span>
            </div>
          </div>
          <div className="pt-1 border-t border-dash-600">
            <span className="text-green-400">Low &lt;35</span>
            <span className="text-slate-600 mx-1">·</span>
            <span className="text-yellow-400">Moderate &lt;55</span>
            <span className="text-slate-600 mx-1">·</span>
            <span className="text-orange-400">High &lt;75</span>
            <span className="text-slate-600 mx-1">·</span>
            <span className="text-red-400">Critical ≥75</span>
          </div>
          {pressure && (
            <div className="pt-1 border-t border-dash-600 space-y-0.5">
              <div className="text-[9px] font-semibold text-slate-500 uppercase tracking-wide mb-1">Current scores</div>
              <div className="flex justify-between"><span>Daily load</span><span className="text-slate-200 font-bold">{pressure.dailyLoad}</span></div>
              <div className="flex justify-between"><span>Peak-hour stress</span><span className="text-slate-200 font-bold">{pressure.peakHourStress}</span></div>
              <div className="flex justify-between"><span>Hotspot concentration</span><span className="text-slate-200 font-bold">{pressure.hotspotConcentration}</span></div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ── KPI card ─────────────────────────────────────────────────────
function KpiCard({ icon: Icon, label, value, sub, color }) {
  return (
    <div className="bg-dash-700 rounded-xl p-2.5">
      <div className="flex items-center gap-1.5 mb-0.5">
        <Icon size={11} style={{ color }} />
        <span className="text-[10px] text-slate-500">{label}</span>
      </div>
      <div className="text-sm font-bold text-white">{value}</div>
      {sub && <div className="text-[9px] text-slate-500 mt-0.5">{sub}</div>}
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────
export default function StatsPanel() {
  const { filteredVisits, allVisits, dataLoaded } = useDashboard()

  const kpi = useMemo(() => computeKPIs(filteredVisits), [filteredVisits])
  const pressure = useMemo(
    () => computePressureMetrics(filteredVisits, allVisits),
    [filteredVisits, allVisits]
  )
  const oti = dataLoaded ? pressure.oti : 0

  return (
    <div>
      <SectionLabel>
        <span className="inline-flex items-center gap-1.5">
          <TrendingUp size={10} /> KPI Snapshot
          {!dataLoaded && <span className="text-slate-600 text-[9px]">loading…</span>}
        </span>
      </SectionLabel>

      <div className="grid grid-cols-2 gap-1.5 mb-3">
        <KpiCard
          icon={BarChart2}
          label="Total visitors"
          value={kpi.total.toLocaleString()}
          sub="unique visitors in current filter"
          color={CYAN}
        />
        <KpiCard
          icon={Calendar}
          label="Peak month"
          value={kpi.peakMonth ? MONTH_NAMES[kpi.peakMonth] : '–'}
          sub="highest visitor count"
          color="#F59E0B"
        />
        <KpiCard
          icon={BarChart2}
          label="Peak hour"
          value={kpi.peakHour != null ? `${String(kpi.peakHour).padStart(2,'0')}:00` : '–'}
          sub="most arrivals"
          color="#8B5CF6"
        />
        <KpiCard
          icon={Clock}
          label="Avg dwell time"
          value={`${kpi.avgDwellDays.toFixed(2)}d`}
          sub="mean duration per visitor"
          color={ORANGE}
        />
      </div>

      {dataLoaded && <PressureGauge value={oti} pressure={pressure} />}
    </div>
  )
}
