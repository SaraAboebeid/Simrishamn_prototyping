import React, { useMemo } from 'react'
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
  PolarRadiusAxis, Tooltip, ResponsiveContainer,
} from 'recharts'
import { useDashboard } from '../../context/DashboardContext'
import { attractions, TOURISM_TYPES } from '../../data/simrishamnData'
import { countVisitsByNearestAttraction } from '../../data/attractionMatching'

const ATTRACTION_MATCH_RADIUS = 0.015

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null
  const d = payload[0]?.payload
  return (
    <div className="bg-dash-800 border border-dash-600 rounded-xl p-3 shadow-2xl text-xs">
      <p className="text-white font-semibold mb-1">{d?.fullLabel}</p>
      <p className="text-slate-400">
        GPS visits: <span className="text-white font-bold">{d?.visitors ?? 0}</span>
      </p>
    </div>
  )
}

export default function TourismRadarChart() {
  const { selectedTypes, filteredVisits } = useDashboard()

  const data = useMemo(() => {
    const counts = countVisitsByNearestAttraction(filteredVisits, attractions, ATTRACTION_MATCH_RADIUS)
    // Group by tourism type
    return TOURISM_TYPES
      .filter(t => selectedTypes.includes(t.id))
      .map(t => {
        const subset = attractions.filter(a => a.type === t.id)
        const visitors = subset.reduce((s, a) => s + (counts[a.id] || 0), 0)
        return {
          subject:   t.label.split(' ')[0],
          fullLabel: t.label,
          visitors,
          color:     t.color,
        }
      })
  }, [filteredVisits, selectedTypes])

  const maxVal = Math.max(...data.map(d => d.visitors), 1)

  return (
    <div className="panel-card chart-card h-full flex flex-col">
      <div className="flex items-center gap-2 mb-3 flex-shrink-0">
        <div className="w-2 h-2 rounded-full" style={{ background: '#8B5CF6' }} />
        <h3 className="text-xs font-semibold text-slate-300">Visits by Tourism Type</h3>
        <span className="ml-auto text-[9px] text-slate-500">{filteredVisits.length.toLocaleString()} total</span>
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
            />
            <Tooltip content={<CustomTooltip />} />
            <Radar
              name="GPS Visits"
              dataKey="visitors"
              stroke="#8B5CF6"
              strokeWidth={2}
              fill="#8B5CF6"
              fillOpacity={0.2}
              dot={{ fill: '#8B5CF6', r: 3, strokeWidth: 0 }}
              activeDot={{ r: 5, fill: '#8B5CF6' }}
              isAnimationActive={false}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
