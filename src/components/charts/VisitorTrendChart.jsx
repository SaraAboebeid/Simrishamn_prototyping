import React, { useMemo } from 'react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from 'recharts'
import { useDashboard } from '../../context/DashboardContext'
import { aggregateMonthly } from '../../data/visitDataLoader'
import { MONTH_NAMES } from '../../data/swedishCalendar'

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-dash-800 border border-dash-600 rounded-xl p-3 shadow-2xl text-xs">
      <p className="text-slate-400 font-semibold mb-1">{label}</p>
      {payload.map((e, i) => (
        <div key={i} className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ background: e.color }} />
          <span className="text-slate-400">{e.name}:</span>
          <span className="text-white font-bold">{e.value}</span>
        </div>
      ))}
    </div>
  )
}

export default function VisitorTrendChart() {
  const { filteredVisits } = useDashboard()

  const data = useMemo(() =>
    aggregateMonthly(filteredVisits).map(d => ({
      name:    MONTH_NAMES[d.month],
      visits:  d.visits,
      unique:  d.uniqueVisitors,
      avgDwell: d.avgDwell,
    })),
    [filteredVisits]
  )

  return (
    <div className="chart-card bg-dash-800 rounded-2xl border border-dash-600 p-3 flex flex-col h-full">
      <div className="flex items-center gap-2 mb-3 flex-shrink-0">
        <div className="w-2 h-2 rounded-full" style={{ background: '#06B6D4' }} />
        <span className="text-[11px] font-semibold text-slate-200">Visit Trend · 2024</span>
        <div className="ml-auto flex gap-3 text-[9px] text-slate-500">
          <span><span className="inline-block w-2 h-2 rounded-full bg-cyan-400 mr-1" />Visits</span>
          <span><span className="inline-block w-2 h-2 rounded-full bg-emerald-400 mr-1" />Unique</span>
        </div>
      </div>
      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
            <defs>
              <linearGradient id="gVisits" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#06B6D4" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#06B6D4" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gUnique" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#10B981" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#2D3A52" vertical={false} />
            <XAxis dataKey="name" tick={{ fill: '#64748B', fontSize: 9 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#64748B', fontSize: 9 }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Area dataKey="visits" name="Total visits"
              stroke="#06B6D4" strokeWidth={2} fill="url(#gVisits)"
              dot={false} activeDot={{ r: 4, fill: '#06B6D4' }}
              isAnimationActive={false}
            />
            <Area dataKey="unique" name="Unique visitors"
              stroke="#10B981" strokeWidth={1.5} fill="url(#gUnique)"
              dot={false} activeDot={{ r: 3, fill: '#10B981' }}
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
