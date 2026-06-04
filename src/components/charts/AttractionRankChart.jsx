import React, { useMemo } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, Cell, LabelList,
} from 'recharts'
import { useDashboard } from '../../context/DashboardContext'
import { attractions, TOURISM_TYPES } from '../../data/simrishamnData'
import { PRESSURE_COLORS } from '../../theme/colors'

const VISIT_RADIUS_DEG = 0.013

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  const a = attractions.find(x => x.name === label)
  const typeObj = TOURISM_TYPES.find(t => t.id === a?.type)
  return (
    <div className="bg-dash-800 border border-dash-600 rounded-xl p-3 shadow-2xl text-xs">
      <div className="flex items-center gap-2 mb-2">
        <span>{typeObj?.icon}</span>
        <p className="text-white font-semibold">{label}</p>
      </div>
      <p className="text-slate-400">
        GPS visits: <span className="text-white font-bold">{payload[0]?.value}</span>
      </p>
      {a && (
        <p className="text-slate-400 mt-0.5">
          Pressure: <span style={{ color: PRESSURE_COLORS[a.pressureLevel], fontWeight: 700 }}>
            {a.pressureLevel}
          </span>
        </p>
      )}
    </div>
  )
}

export default function AttractionRankChart() {
  const { selectedTypes, setSelectedAttraction, filteredVisits } = useDashboard()

  const data = useMemo(() => {
    // Count real GPS visits within radius of each attraction
    const counts = {}
    attractions.forEach(a => { counts[a.id] = 0 })
    filteredVisits.forEach(v => {
      attractions.forEach(a => {
        if (
          Math.abs(v.lat - a.coords[0]) < VISIT_RADIUS_DEG &&
          Math.abs(v.lon - a.coords[1]) < VISIT_RADIUS_DEG
        ) counts[a.id]++
      })
    })
    return attractions
      .filter(a => selectedTypes.includes(a.type))
      .map(a => ({
        name:     a.name,
        visitors: counts[a.id] || 0,
        color:    TOURISM_TYPES.find(t => t.id === a.type)?.color || '#94A3B8',
        pressure: a.pressureLevel,
        id:       a.id,
      }))
      .sort((a, b) => b.visitors - a.visitors)
  }, [filteredVisits, selectedTypes])

  return (
    <div className="panel-card chart-card h-full flex flex-col">
      <div className="flex items-center gap-2 mb-3 flex-shrink-0">
        <div className="w-2 h-2 rounded-full" style={{ background: '#F59E0B' }} />
        <h3 className="text-xs font-semibold text-slate-300">Attraction Visits (GPS)</h3>
        <span className="ml-auto text-[9px] text-slate-500">{filteredVisits.length.toLocaleString()} total</span>
      </div>
      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 2, right: 56, left: 4, bottom: 0 }}
            barSize={10}
            onClick={d => d?.activePayload?.[0]?.payload?.id && setSelectedAttraction(d.activePayload[0].payload.id)}
          >
            <XAxis
              type="number"
              tick={{ fill: '#64748B', fontSize: 9 }}
              axisLine={{ stroke: '#2D3A52' }}
              tickLine={false}
            />
            <YAxis
              type="category"
              dataKey="name"
              tick={{ fill: '#94A3B8', fontSize: 9 }}
              axisLine={false}
              tickLine={false}
              width={108}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
            <Bar dataKey="visitors" name="Visitors" radius={[0, 4, 4, 0]}>
              {data.map((d, i) => (
                <Cell
                  key={i}
                  fill={d.color}
                  style={{ cursor: 'pointer' }}
                />
              ))}
              <LabelList
                dataKey="visitors"
                position="right"
                style={{ fill: '#94A3B8', fontSize: 9, fontWeight: 600 }}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
