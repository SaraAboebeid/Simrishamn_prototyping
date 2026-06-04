import React, { useMemo } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, Cell, LabelList,
} from 'recharts'
import { useDashboard } from '../../context/DashboardContext'
import {
  attractions, TOURISM_TYPES, formatVisitors,
} from '../../data/simrishamnData'
import { PRESSURE_COLORS } from '../../theme/colors'

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
        Visitors: <span className="text-white font-bold">{formatVisitors(payload[0]?.value)}</span>
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
  const { selectedYear, selectedTypes, setSelectedAttraction } = useDashboard()

  const data = useMemo(() => {
    return attractions
      .filter(a => selectedTypes.includes(a.type))
      .map(a => ({
        name:     a.name,
        visitors: a.visitors[selectedYear] || 0,
        color:    TOURISM_TYPES.find(t => t.id === a.type)?.color || '#94A3B8',
        pressure: a.pressureLevel,
        id:       a.id,
      }))
      .sort((a, b) => b.visitors - a.visitors)
  }, [selectedYear, selectedTypes])

  return (
    <div className="panel-card chart-card h-full flex flex-col">
      <div className="flex items-center gap-2 mb-3 flex-shrink-0">
        <div className="w-2 h-2 rounded-full" style={{ background: '#FFCD00' }} />
        <h3 className="text-xs font-semibold text-slate-300">Top Attractions {selectedYear}</h3>
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
              tickFormatter={formatVisitors}
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
                formatter={formatVisitors}
                style={{ fill: '#94A3B8', fontSize: 9, fontWeight: 600 }}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
