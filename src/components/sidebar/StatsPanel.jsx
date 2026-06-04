import React, { useMemo } from 'react'
import { TrendingUp, Clock, BarChart2, Calendar } from 'lucide-react'
import { useDashboard } from '../../context/DashboardContext'
import { computeKPIs, computePressureMetrics } from '../../data/visitDataLoader'
import { PRESSURE_COLORS, ORANGE, CYAN } from '../../theme/colors'
import { MONTH_NAMES } from '../../data/swedishCalendar'
import { SectionLabel } from './ui'

// ── SVG arc gauge for Overtourism pressure ───────────────────────
function PressureGauge({ value }) {
  const r    = 26
  const circ = 2 * Math.PI * r
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
        <div className="text-[10px] text-slate-500 leading-tight">Overtourism<br />Pressure</div>
      </div>
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

  const avgDwellH = kpi.avgDwellMin ? (kpi.avgDwellMin / 60).toFixed(1) : '–'

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
          icon={Clock}
          label="Avg dwell time"
          value={`${avgDwellH}h`}
          sub={`${kpi.avgDwellMin} min mean duration per visitor`}
          color={ORANGE}
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
      </div>

      {dataLoaded && <PressureGauge value={oti} />}

      {dataLoaded && (
        <div className="mt-2 text-[9px] text-slate-400 space-y-0.5">
          <div>Daily load vs median: <span className="text-slate-200">{pressure.dailyLoad}</span></div>
          <div>Peak-hour stress (p95): <span className="text-slate-200">{pressure.peakHourStress}</span></div>
          <div>Hotspot concentration: <span className="text-slate-200">{pressure.hotspotConcentration}</span></div>
        </div>
      )}
    </div>
  )
}
