import React, { useMemo } from 'react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ReferenceLine, ResponsiveContainer, Legend,
} from 'recharts'
import { useDashboard } from '../../context/DashboardContext'
import { yearlyStats, YEARS, formatVisitors } from '../../data/simrishamnData'

const data = YEARS.map(y => {
  const s = yearlyStats[y]
  return { year: y, total: s.total, domestic: s.domestic, international: s.international }
})

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-dash-800 border border-dash-600 rounded-xl p-3 shadow-2xl text-xs">
      <p className="text-slate-400 font-semibold mb-2">{label}</p>
      {payload.map((e, i) => (
        <div key={i} className="flex items-center gap-2 mb-1">
          <div className="w-2 h-2 rounded-full" style={{ background: e.color }} />
          <span className="text-slate-400">{e.name}:</span>
          <span className="text-white font-bold">{formatVisitors(e.value)}</span>
        </div>
      ))}
    </div>
  )
}

export default function VisitorTrendChart() {
  const { selectedYear } = useDashboard()

  return (
    <div className="panel-card chart-card h-full flex flex-col">
      <div className="flex items-center gap-2 mb-3 flex-shrink-0">
        <div className="w-2 h-2 rounded-full" style={{ background: '#06B6D4' }} />
        <h3 className="text-xs font-semibold text-slate-300">Visitor Trend 2018 – 2024</h3>
      </div>
      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="gTotal" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#06B6D4" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#06B6D4" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gDomestic" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#10B981" stopOpacity={0.30} />
                <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gIntl" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#F59E0B" stopOpacity={0.30} />
                <stop offset="95%" stopColor="#F59E0B" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#2D3A52" vertical={false} />
            <XAxis
              dataKey="year"
              tick={{ fill: '#64748B', fontSize: 10 }}
              axisLine={{ stroke: '#2D3A52' }}
              tickLine={false}
            />
            <YAxis
              tickFormatter={formatVisitors}
              tick={{ fill: '#64748B', fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              width={36}
            />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine
              x={selectedYear}
              stroke="#FF6B35"
              strokeDasharray="4 3"
              strokeWidth={1.5}
              label={{ value: selectedYear, fill: '#FF6B35', fontSize: 9, dy: -6 }}
            />
            <Area
              dataKey="total"     name="Total"
              stroke="#06B6D4"    strokeWidth={2}
              fill="url(#gTotal)" dot={false} activeDot={{ r: 4, fill: '#06B6D4' }}
            />
            <Area
              dataKey="domestic"  name="Domestic"
              stroke="#10B981"    strokeWidth={1.5}
              fill="url(#gDomestic)" dot={false} activeDot={{ r: 3, fill: '#10B981' }}
            />
            <Area
              dataKey="international" name="International"
              stroke="#F59E0B"    strokeWidth={1.5}
              fill="url(#gIntl)"  dot={false} activeDot={{ r: 3, fill: '#F59E0B' }}
            />
            <Legend
              wrapperStyle={{ fontSize: 10, paddingTop: 4 }}
              formatter={v => <span style={{ color: '#94A3B8' }}>{v}</span>}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
