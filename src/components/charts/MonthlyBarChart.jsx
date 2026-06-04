import React, { useMemo } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell, ReferenceLine,
} from 'recharts'
import { useDashboard } from '../../context/DashboardContext'
import { aggregateMonthly } from '../../data/visitDataLoader'
import { MONTH_NAMES } from '../../data/swedishCalendar'

const SEASON_COLORS = [
  '#38BDF8','#38BDF8',          // Jan, Feb  – winter
  '#4ADE80','#4ADE80','#4ADE80',// Mar-May   – spring
  '#FF6B35','#FF6B35','#FF6B35',// Jun-Aug   – summer
  '#F59E0B','#F59E0B','#F59E0B',// Sep-Nov   – autumn
  '#38BDF8',                    // Dec       – winter
]

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  const d = payload[0]?.payload
  return (
    <div className="bg-dash-800 border border-dash-600 rounded-xl p-3 shadow-2xl text-xs">
      <p className="text-slate-400 font-semibold mb-1">{label} 2024</p>
      <p className="text-white font-bold">{d?.visitors} visitors</p>
      <p className="text-slate-400">Avg dwell {d?.avgDwell} min</p>
    </div>
  )
}

export default function MonthlyBarChart() {
  const { filteredVisits } = useDashboard()

  const data = useMemo(() =>
    aggregateMonthly(filteredVisits).map(d => ({
      ...d,
      name: MONTH_NAMES[d.month],
    })),
    [filteredVisits]
  )

  const peakByVisitors = useMemo(() => data.reduce((a, b) => b.visitors > a.visitors ? b : a, data[0]), [data])

  return (
    <div className="chart-card bg-dash-800 rounded-2xl border border-dash-600 p-3 flex flex-col h-full">
      <div className="flex items-center gap-2 mb-3 flex-shrink-0">
        <div className="w-2 h-2 rounded-full" style={{ background: '#FF6B35' }} />
        <span className="text-[11px] font-semibold text-slate-200">Monthly Visitors 2024</span>
        <span className="ml-auto text-[10px] text-slate-500">
          Peak <span className="text-orange-400 font-bold">{MONTH_NAMES[peakByVisitors?.month ?? 1]}</span>
        </span>
      </div>
      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 4, right: 4, left: -24, bottom: 0 }} barCategoryGap="12%">
            <CartesianGrid strokeDasharray="3 3" stroke="#2D3A52" vertical={false} />
            <XAxis dataKey="name" tick={{ fill: '#64748B', fontSize: 9 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#64748B', fontSize: 9 }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
            <ReferenceLine y={0} stroke="#2D3A52" />
            <Bar dataKey="visitors" radius={[4, 4, 0, 0]} isAnimationActive={false}>
              {data.map((d, i) => (
                <Cell key={i}
                  fill={SEASON_COLORS[i]}
                  fillOpacity={d.month === peakByVisitors?.month ? 1 : 0.65}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
