import React, { useMemo } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  CartesianGrid, Cell, ResponsiveContainer,
} from 'recharts'
import { useDashboard } from '../../context/DashboardContext'
import { aggregateDwellBuckets } from '../../data/visitDataLoader'

const BUCKET_COLORS = ['#38BDF8', '#4ADE80', '#F59E0B', '#F97316', '#EF4444']

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null
  const { label, visitors } = payload[0].payload
  const pct = payload[0].payload._pct
  return (
    <div className="bg-dash-700 border border-dash-600 rounded-xl px-3 py-2 text-xs shadow-xl">
      <div className="text-slate-400">{label}</div>
      <div className="text-white font-bold">{visitors} visitors ({pct}%)</div>
    </div>
  )
}

export default function DwellTimeChart() {
  const { filteredVisits } = useDashboard()

  const data = useMemo(() => {
    const buckets = aggregateDwellBuckets(filteredVisits)
    const total = buckets.reduce((s, b) => s + b.visitors, 0) || 1
    return buckets.map(b => ({
      ...b,
      _pct: Math.round(b.visitors / total * 100),
    }))
  }, [filteredVisits])

  const avgH = useMemo(() => {
    if (!filteredVisits.length) return 0
    return (filteredVisits.reduce((s, v) => s + v.dwellMin, 0) / filteredVisits.length / 60).toFixed(1)
  }, [filteredVisits])

  return (
    <div className="chart-card bg-dash-800 rounded-2xl border border-dash-600 p-3 flex flex-col h-full">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-2 h-2 rounded-full" style={{ background: '#F59E0B' }} />
        <span className="text-[11px] font-semibold text-slate-200">Dwell Time by Visitor</span>
        <span className="ml-auto text-[10px] text-slate-500">
          Avg <span className="text-amber-400 font-bold">{avgH}h</span>
        </span>
      </div>

      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 4, right: 4, left: -24, bottom: 0 }} barCategoryGap="20%">
            <CartesianGrid strokeDasharray="3 3" stroke="#2D3A52" vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fill: '#64748B', fontSize: 9 }}
              axisLine={false} tickLine={false}
            />
            <YAxis tick={{ fill: '#64748B', fontSize: 9 }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="visitors" radius={[4, 4, 0, 0]} isAnimationActive={false}>
              {data.map((d, i) => (
                <Cell key={d.label} fill={BUCKET_COLORS[i]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
