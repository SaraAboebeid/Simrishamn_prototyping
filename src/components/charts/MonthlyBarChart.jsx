import React, { useMemo } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell,
} from 'recharts'
import { useDashboard } from '../../context/DashboardContext'
import { getFilteredMonthlyData, formatVisitors } from '../../data/simrishamnData'

const SEASON_MONTH_COLORS = {
  // Dec–Feb: winter blue,  Mar–May: spring green,  Jun–Aug: summer orange,  Sep–Nov: autumn amber
  Jan:'#38BDF8', Feb:'#38BDF8', Mar:'#4ADE80', Apr:'#4ADE80', May:'#4ADE80',
  Jun:'#FF6B35', Jul:'#FF6B35', Aug:'#FF6B35', Sep:'#F59E0B', Oct:'#F59E0B',
  Nov:'#F59E0B', Dec:'#38BDF8',
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-dash-800 border border-dash-600 rounded-xl p-3 shadow-2xl text-xs">
      <p className="text-slate-400 font-semibold mb-2">{label}</p>
      {payload.map((e, i) => (
        <div key={i} className="flex items-center gap-2 mb-1">
          <div className="w-2 h-2 rounded-full" style={{ background: e.fill || e.color }} />
          <span className="text-slate-400">{e.name}:</span>
          <span className="text-white font-bold">{formatVisitors(e.value)}</span>
        </div>
      ))}
    </div>
  )
}

export default function MonthlyBarChart() {
  const { selectedYear, selectedSeason } = useDashboard()

  const data = useMemo(
    () => getFilteredMonthlyData(selectedYear, selectedSeason),
    [selectedYear, selectedSeason]
  )

  return (
    <div className="panel-card chart-card h-full flex flex-col">
      <div className="flex items-center gap-2 mb-3 flex-shrink-0">
        <div className="w-2 h-2 rounded-full bg-tourism-orange" />
        <h3 className="text-xs font-semibold text-slate-300">Monthly Distribution {selectedYear}</h3>
      </div>
      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 0 }} barSize={14}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2D3A52" vertical={false} />
            <XAxis
              dataKey="month"
              tick={{ fill: '#64748B', fontSize: 9 }}
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
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
            <Bar dataKey="domestic"      name="Domestic"      stackId="a" radius={[0,0,0,0]}>
              {data.map((d, i) => (
                <Cell key={i} fill={SEASON_MONTH_COLORS[d.month] || '#06B6D4'} fillOpacity={0.85} />
              ))}
            </Bar>
            <Bar dataKey="international" name="International"  stackId="a" radius={[3,3,0,0]}>
              {data.map((d, i) => (
                <Cell key={i} fill={SEASON_MONTH_COLORS[d.month] || '#06B6D4'} fillOpacity={0.45} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
