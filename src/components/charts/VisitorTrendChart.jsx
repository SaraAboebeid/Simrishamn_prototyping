import React, { useEffect, useMemo, useState } from 'react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Brush,
} from 'recharts'
import { useDashboard } from '../../context/DashboardContext'
import { aggregateMonthly } from '../../data/visitDataLoader'
import { MONTH_NAMES } from '../../data/swedishCalendar'

const MONTH_LINE_COLORS = [
  '#06B6D4', '#10B981', '#F59E0B', '#EF4444', '#A78BFA', '#22C55E',
  '#F97316', '#38BDF8', '#84CC16', '#F43F5E', '#14B8A6', '#EAB308',
]

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-dash-800 border border-dash-600 rounded-xl p-3 shadow-2xl text-xs">
      <p className="text-slate-400 font-semibold mb-1">{label}</p>
      {payload.map((e, i) => (
        <div key={i} className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ background: e.color }} />
          <span className="text-slate-400">{e.name}:</span>
          <span className="text-white font-bold">{e.value ?? 0}</span>
        </div>
      ))}
    </div>
  )
}

function aggregateDaily(visits) {
  const byDate = {}
  visits.forEach(v => {
    if (!byDate[v.date]) byDate[v.date] = new Set()
    byDate[v.date].add(v.uid)
  })
  return Object.entries(byDate)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([date, uids]) => {
      const [y, m, d] = date.split('-')
      return {
        date,
        label: `${d}/${m}`,
        visitors: uids.size,
        year: y,
      }
    })
}

function buildMonthComparison(visits, selectedMonths) {
  const months = (selectedMonths?.length
    ? [...selectedMonths]
    : Array.from({ length: 12 }, (_, i) => i + 1)
  ).sort((a, b) => a - b)

  const byMonthDay = Object.fromEntries(
    months.map(m => [m, Array.from({ length: 32 }, () => new Set())])
  )

  visits.forEach(v => {
    if (!byMonthDay[v.month]) return
    byMonthDay[v.month][v.day].add(v.uid)
  })

  const data = Array.from({ length: 31 }, (_, i) => {
    const day = i + 1
    const row = { day, label: String(day) }
    months.forEach(m => {
      row[`m${m}`] = byMonthDay[m][day]?.size || 0
    })
    return row
  })

  const lines = months.map((m, i) => ({
    key: `m${m}`,
    name: MONTH_NAMES[m],
    color: MONTH_LINE_COLORS[i % MONTH_LINE_COLORS.length],
  }))

  return { data, lines, months, xKey: 'label' }
}

export default function VisitorTrendChart() {
  const { filteredVisits, periodMode, selectedMonths } = useDashboard()
  const [brushRange, setBrushRange] = useState(null)

  const isMonthMode = periodMode === 'month'

  const monthlyData = useMemo(() =>
    aggregateMonthly(filteredVisits).map(d => ({
      month: d.month,
      name: MONTH_NAMES[d.month],
      visitors: d.visitors,
    })),
    [filteredVisits]
  )

  const monthComparison = useMemo(
    () => buildMonthComparison(filteredVisits, selectedMonths),
    [filteredVisits, selectedMonths]
  )

  const mainData = isMonthMode ? monthComparison.data : monthlyData
  const mainLines = isMonthMode
    ? monthComparison.lines
    : [{ key: 'visitors', name: 'Visitors', color: '#06B6D4' }]
  const mainXKey = isMonthMode ? monthComparison.xKey : 'name'

  useEffect(() => {
    setBrushRange(null)
  }, [periodMode, selectedMonths, filteredVisits.length])

  const selectedVisits = useMemo(() => {
    if (!brushRange || brushRange.startIndex == null || brushRange.endIndex == null) return []
    if (!mainData.length) return []

    const start = Math.max(0, Math.min(brushRange.startIndex, brushRange.endIndex))
    const end = Math.min(mainData.length - 1, Math.max(brushRange.startIndex, brushRange.endIndex))

    if (start === 0 && end === mainData.length - 1) return []

    if (isMonthMode) {
      const startDay = mainData[start]?.day
      const endDay = mainData[end]?.day
      const monthSet = new Set(monthComparison.months)
      return filteredVisits.filter(v => monthSet.has(v.month) && v.day >= startDay && v.day <= endDay)
    }

    const startMonth = mainData[start]?.month
    const endMonth = mainData[end]?.month
    return filteredVisits.filter(v => v.month >= startMonth && v.month <= endMonth)
  }, [brushRange, mainData, filteredVisits, isMonthMode, monthComparison.months])

  const drillData = useMemo(() => aggregateDaily(selectedVisits), [selectedVisits])

  const handleBrushChange = (range) => {
    if (!range || range.startIndex == null || range.endIndex == null) {
      setBrushRange(null)
      return
    }
    setBrushRange({ startIndex: range.startIndex, endIndex: range.endIndex })
  }

  return (
    <div className="chart-card bg-dash-800 rounded-2xl border border-dash-600 p-3 flex flex-col h-full">
      <div className="flex items-center gap-2 mb-3 flex-shrink-0">
        <div className="w-2 h-2 rounded-full" style={{ background: '#06B6D4' }} />
        <span className="text-[11px] font-semibold text-slate-200">
          {isMonthMode ? 'Visitor Trend · Monthly lines by day' : 'Visitor Trend · 2024'}
        </span>
        <div className="ml-auto flex gap-3 text-[9px] text-slate-500">
          <span><span className="inline-block w-2 h-2 rounded-full bg-cyan-400 mr-1" />Visitors</span>
          <span className="text-slate-500">Brush chart to drill to daily</span>
        </div>
      </div>
      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={mainData} margin={{ top: 4, right: 8, left: -24, bottom: 16 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2D3A52" vertical={false} />
            <XAxis dataKey={mainXKey} tick={{ fill: '#64748B', fontSize: 9 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#64748B', fontSize: 9 }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            {mainLines.map(line => (
              <Line
                key={line.key}
                dataKey={line.key}
                name={line.name}
                type="monotone"
                stroke={line.color}
                strokeWidth={1.8}
                dot={false}
                activeDot={{ r: 3, fill: line.color }}
                isAnimationActive={false}
              />
            ))}
            <Brush
              dataKey={mainXKey}
              height={16}
              stroke="#38BDF8"
              travellerWidth={8}
              onChange={handleBrushChange}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {!!drillData.length && (
        <div className="h-24 mt-2 pt-2 border-t border-dash-600">
          <div className="flex items-center mb-1.5">
            <div className="text-[10px] text-slate-400 font-semibold">Daily in selected timeframe</div>
            <button
              onClick={() => setBrushRange(null)}
              className="ml-auto text-[9px] text-slate-500 hover:text-orange-400 transition-colors"
            >
              Clear selection
            </button>
          </div>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={drillData} margin={{ top: 2, right: 8, left: -24, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2D3A52" vertical={false} />
              <XAxis dataKey="label" tick={{ fill: '#64748B', fontSize: 8 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#64748B', fontSize: 8 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Line
                dataKey="visitors"
                name="Daily visitors"
                type="monotone"
                stroke="#F59E0B"
                strokeWidth={1.8}
                dot={false}
                activeDot={{ r: 3, fill: '#F59E0B' }}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}
