import React, { useState } from 'react'
import { Calendar, Clock, Sun, Snowflake, Flag, CalendarDays } from 'lucide-react'
import { useDashboard } from '../../context/DashboardContext'
import { MONTH_NAMES, SEASONS_2024, HOLIDAYS_2024, LONG_WEEKENDS_2024 } from '../../data/swedishCalendar'
import { SectionLabel } from './ui'

const MODE_TABS = [
  { key: 'all',         label: 'All',      icon: CalendarDays },
  { key: 'date',        label: 'Date',     icon: Calendar },
  { key: 'month',       label: 'Month',    icon: CalendarDays },
  { key: 'season',      label: 'Season',   icon: Sun },
  { key: 'holiday',     label: 'Holidays', icon: Flag },
  { key: 'longweekend', label: 'LW',       icon: Snowflake },
]

const SEASON_COLOR = { winter:'#38BDF8', spring:'#4ADE80', summer:'#FF6B35', autumn:'#F59E0B' }

export default function DateTimeFilter() {
  const {
    hourFrom, setHourFrom, hourTo, setHourTo,
    dateFrom, setDateFrom, dateTo, setDateTo,
    periodMode, setPeriodMode,
    selectedMonths, toggleMonth,
    selectedSeason, setSelectedSeason,
    selectedPeriod, setSelectedPeriod,
    filteredVisits,
  } = useDashboard()

  const [showTime, setShowTime] = useState(false)

  function setMode(k) {
    setPeriodMode(k)
    setSelectedSeason(null)
    setSelectedPeriod(null)
  }

  const badge = filteredVisits.length

  return (
    <div className="space-y-2">
      <SectionLabel>
        <span className="inline-flex items-center gap-1.5">
          <Calendar size={10} /> Time Filter
          <span className="ml-auto text-orange-400 font-semibold">{badge.toLocaleString()} visits</span>
        </span>
      </SectionLabel>

      {/* Mode tabs */}
      <div className="grid grid-cols-3 gap-1">
        {MODE_TABS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setMode(key)}
            className="flex items-center justify-center gap-1 py-1 px-1.5 rounded-lg text-[10px] font-semibold transition-all"
            style={{
              background: periodMode === key ? '#FF6B35' : '#1E2840',
              color:      periodMode === key ? '#fff'    : '#94A3B8',
              boxShadow:  periodMode === key ? '0 2px 10px rgba(255,107,53,0.35)' : 'none',
            }}
          >
            <Icon size={9} />
            {label}
          </button>
        ))}
      </div>

      {/* ── Date range ─────────────────────── */}
      {periodMode === 'date' && (
        <div className="space-y-1.5">
          <div className="flex gap-2">
            <div className="flex-1">
              <div className="text-[9px] text-slate-500 mb-0.5">From</div>
              <input
                type="date"
                min="2024-01-01" max="2024-12-31"
                value={dateFrom || ''}
                onChange={e => setDateFrom(e.target.value || null)}
                className="w-full text-[10px] bg-dash-700 border border-dash-600 rounded-lg px-2 py-1 text-slate-200 focus:outline-none focus:border-orange-500"
              />
            </div>
            <div className="flex-1">
              <div className="text-[9px] text-slate-500 mb-0.5">To</div>
              <input
                type="date"
                min="2024-01-01" max="2024-12-31"
                value={dateTo || ''}
                onChange={e => setDateTo(e.target.value || null)}
                className="w-full text-[10px] bg-dash-700 border border-dash-600 rounded-lg px-2 py-1 text-slate-200 focus:outline-none focus:border-orange-500"
              />
            </div>
          </div>
          {(dateFrom || dateTo) && (
            <button
              onClick={() => { setDateFrom(null); setDateTo(null) }}
              className="text-[9px] text-slate-500 hover:text-orange-400 transition-colors"
            >
              ✕ Clear dates
            </button>
          )}
        </div>
      )}

      {/* ── Month grid ─────────────────────── */}
      {periodMode === 'month' && (
        <div className="grid grid-cols-4 gap-1">
          {MONTH_NAMES.slice(1).map((name, i) => {
            const m = i + 1
            const active = selectedMonths.includes(m)
            return (
              <button
                key={m}
                onClick={() => toggleMonth(m)}
                className="py-1 rounded-lg text-[10px] font-semibold transition-all"
                style={{
                  background: active ? '#F59E0B' : '#1E2840',
                  color:      active ? '#0D1117' : '#94A3B8',
                }}
              >
                {name}
              </button>
            )
          })}
        </div>
      )}

      {/* ── Season ─────────────────────────── */}
      {periodMode === 'season' && (
        <div className="grid grid-cols-2 gap-1.5">
          {SEASONS_2024.map(s => (
            <button
              key={s.key}
              onClick={() => setSelectedSeason(selectedSeason === s.key ? null : s.key)}
              className="py-1.5 rounded-xl text-[10px] font-bold transition-all"
              style={{
                background: selectedSeason === s.key ? s.color : '#1E2840',
                color:      selectedSeason === s.key ? '#0D1117' : '#94A3B8',
                boxShadow:  selectedSeason === s.key ? `0 2px 10px ${s.color}66` : 'none',
              }}
            >
              {s.label}
              <div className="text-[8px] font-normal opacity-70">
                {s.months.map(m => MONTH_NAMES[m]).join('/')}
              </div>
            </button>
          ))}
        </div>
      )}

      {/* ── Swedish Holidays ───────────────── */}
      {periodMode === 'holiday' && (
        <div className="space-y-1 max-h-36 overflow-y-auto pr-0.5">
          {HOLIDAYS_2024.map(h => (
            <button
              key={h.key}
              onClick={() => setSelectedPeriod(selectedPeriod === h.key ? null : h.key)}
              className="w-full flex justify-between items-center px-2.5 py-1.5 rounded-lg text-left transition-all"
              style={{
                background: selectedPeriod === h.key ? 'rgba(255,107,53,0.18)' : '#1E2840',
                border:     selectedPeriod === h.key ? '1px solid #FF6B35' : '1px solid transparent',
              }}
            >
              <span className="text-[10px] text-slate-300">{h.label}</span>
              <span className="text-[9px] text-slate-500">{h.dates[0]}</span>
            </button>
          ))}
        </div>
      )}

      {/* ── Long Weekends ──────────────────── */}
      {periodMode === 'longweekend' && (
        <div className="space-y-1">
          {LONG_WEEKENDS_2024.map(lw => (
            <button
              key={lw.key}
              onClick={() => setSelectedPeriod(selectedPeriod === lw.key ? null : lw.key)}
              className="w-full flex justify-between items-center px-2.5 py-1.5 rounded-lg text-left transition-all"
              style={{
                background: selectedPeriod === lw.key ? 'rgba(6,182,212,0.18)' : '#1E2840',
                border:     selectedPeriod === lw.key ? '1px solid #06B6D4' : '1px solid transparent',
              }}
            >
              <span className="text-[10px] text-slate-300">{lw.label}</span>
              <span className="text-[9px] text-slate-500">{lw.dates.length}d</span>
            </button>
          ))}
        </div>
      )}

      {/* ── Time of day ────────────────────── */}
      <button
        onClick={() => setShowTime(p => !p)}
        className="w-full flex items-center gap-1.5 text-[10px] text-slate-400 hover:text-slate-200 transition-colors mt-1"
      >
        <Clock size={10} />
        <span>Time of day</span>
        <span className="ml-auto text-orange-400 font-semibold">{hourFrom}:00 – {hourTo}:59</span>
        <span className="text-[8px]">{showTime ? '▲' : '▼'}</span>
      </button>

      {showTime && (
        <div className="space-y-2 pt-1">
          <div className="flex gap-2 items-center">
            <label className="text-[9px] text-slate-500 w-7">From</label>
            <select
              value={hourFrom}
              onChange={e => setHourFrom(+e.target.value)}
              className="flex-1 text-[10px] bg-dash-700 border border-dash-600 rounded-lg px-1.5 py-1 text-slate-200 focus:outline-none focus:border-orange-500"
            >
              {Array.from({ length: 24 }, (_, h) => (
                <option key={h} value={h}>{String(h).padStart(2,'0')}:00</option>
              ))}
            </select>
            <label className="text-[9px] text-slate-500 w-4">To</label>
            <select
              value={hourTo}
              onChange={e => setHourTo(+e.target.value)}
              className="flex-1 text-[10px] bg-dash-700 border border-dash-600 rounded-lg px-1.5 py-1 text-slate-200 focus:outline-none focus:border-orange-500"
            >
              {Array.from({ length: 24 }, (_, h) => (
                <option key={h} value={h}>{String(h).padStart(2,'0')}:59</option>
              ))}
            </select>
          </div>
          {/* Hour bar sparkline */}
          <HourSparkline hourFrom={hourFrom} hourTo={hourTo} />
        </div>
      )}
    </div>
  )
}

function HourSparkline({ hourFrom, hourTo }) {
  const { filteredVisits } = useDashboard()
  const counts = Array(24).fill(0)
  filteredVisits.forEach(v => { counts[v.startHour]++ })
  const max = Math.max(...counts, 1)

  return (
    <div className="flex items-end gap-px h-8">
      {counts.map((c, h) => {
        const inRange = h >= hourFrom && h <= hourTo
        return (
          <div
            key={h}
            className="flex-1 rounded-sm transition-all"
            title={`${h}:00 — ${c} visits`}
            style={{
              height: `${Math.max(4, (c / max) * 100)}%`,
              background: inRange ? '#FF6B35' : '#2D3A52',
              opacity: inRange ? 1 : 0.4,
            }}
          />
        )
      })}
    </div>
  )
}
