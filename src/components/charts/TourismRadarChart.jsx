import React, { useMemo } from 'react'
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
  PolarRadiusAxis, Tooltip, ResponsiveContainer,
} from 'recharts'
import { useDashboard } from '../../context/DashboardContext'
import { getTourismTypeStats, formatVisitors } from '../../data/simrishamnData'

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null
  const d = payload[0]?.payload
  return (
    <div className="bg-dash-800 border border-dash-600 rounded-xl p-3 shadow-2xl text-xs">
      <p className="text-white font-semibold mb-1">{d?.fullLabel}</p>
      <p className="text-slate-400">
        Visitors: <span className="text-white font-bold">{formatVisitors(d?.visitors || 0)}</span>
      </p>
      <p className="text-slate-400">
        vs Peak: <span className="text-white font-bold">{d?.peakPct}%</span>
      </p>
    </div>
  )
}

export default function TourismRadarChart() {
  const { selectedYear, selectedTypes } = useDashboard()

  const data = useMemo(
    () => getTourismTypeStats(selectedYear, selectedTypes),
    [selectedYear, selectedTypes]
  )

  const maxVal = Math.max(...data.map(d => d.visitors), 1)

  return (
    <div className="panel-card chart-card h-full flex flex-col">
      <div className="flex items-center gap-2 mb-3 flex-shrink-0">
        <div className="w-2 h-2 rounded-full" style={{ background: '#FFCD00' }} />
        <h3 className="text-xs font-semibold text-slate-300">Tourism Type Distribution</h3>
      </div>
      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={data} margin={{ top: 0, right: 20, left: 20, bottom: 0 }}>
            <PolarGrid stroke="#2D3A52" gridType="polygon" />
            <PolarAngleAxis
              dataKey="subject"
              tick={{ fill: '#94A3B8', fontSize: 10, fontWeight: 500 }}
            />
            <PolarRadiusAxis
              domain={[0, maxVal]}
              tickCount={4}
              tick={{ fill: '#475569', fontSize: 8 }}
              axisLine={false}
              tickFormatter={formatVisitors}
            />
            <Tooltip content={<CustomTooltip />} />
            <Radar
              name="Visitors"
              dataKey="visitors"
              stroke="#FFCD00"
              strokeWidth={2}
              fill="#FFCD00"
              fillOpacity={0.15}
              dot={{ fill: '#FFCD00', r: 3, strokeWidth: 0 }}
              activeDot={{ r: 5, fill: '#FFCD00' }}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
