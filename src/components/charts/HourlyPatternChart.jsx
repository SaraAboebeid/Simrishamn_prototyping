import React, { useMemo } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  CartesianGrid, Cell, ResponsiveContainer,
} from 'recharts'
import { useDashboard } from '../../context/DashboardContext'
import { aggregateHourly } from '../../data/visitDataLoader'

const NIGHT  = '#38BDF8'  // 0-5
const MORN   = '#4ADE80'  // 6-11
const AFTERN = '#FF6B35'  // 12-17
const EVE    = '#8B5CF6'  // 18-23

function hourColor(h) {
  if (h <  6) return NIGHT
  if (h < 12) return MORN
  if (h < 18) return AFTERN
  return EVE
}

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null
  const { hour, visitors } = payload[0].payload
  return (
    <div className="bg-dash-700 border border-dash-600 rounded-xl px-3 py-2 text-xs shadow-xl">
      <div className="text-slate-400">{String(hour).padStart(2,'0')}:00 – {String(hour).padStart(2,'0')}:59</div>
      <div className="text-white font-bold">{visitors} visitors</div>
    </div>
  )
}

export default function HourlyPatternChart() {
  const { filteredVisits } = useDashboard()
  const data = useMemo(() => aggregateHourly(filteredVisits), [filteredVisits])
  const peak = useMemo(() => data.reduce((a, b) => b.visitors > a.visitors ? b : a, data[0]), [data])

  return (
    <div className="chart-card bg-dash-800 rounded-2xl border border-dash-600 p-3 flex flex-col h-full">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-2 h-2 rounded-full" style={{ background: '#FF6B35' }} />
        <span className="text-[11px] font-semibold text-slate-200">Visitor Hour Pattern</span>
        <span className="ml-auto text-[10px] text-slate-500">
          Peak <span className="text-orange-400 font-bold">{String(peak?.hour ?? 0).padStart(2,'0')}:00</span>
        </span>
      </div>

      {/* Legend */}
      <div className="flex gap-2 mb-2 flex-wrap">
        {[['Night 0–5', NIGHT], ['Morning 6–11', MORN], ['Afternoon 12–17', AFTERN], ['Evening 18–23', EVE]].map(([l, c]) => (
          <div key={l} className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-sm" style={{ background: c }} />
            <span className="text-[9px] text-slate-500">{l}</span>
          </div>
        ))}
      </div>

      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 4, right: 4, left: -24, bottom: 0 }} barCategoryGap="10%">
            <CartesianGrid strokeDasharray="3 3" stroke="#2D3A52" vertical={false} />
            <XAxis
              dataKey="hour"
              tickFormatter={h => h % 6 === 0 ? `${h}h` : ''}
              tick={{ fill: '#64748B', fontSize: 9 }}
              axisLine={false} tickLine={false}
            />
            <YAxis tick={{ fill: '#64748B', fontSize: 9 }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="visitors" radius={[3, 3, 0, 0]} isAnimationActive={false}>
              {data.map(d => (
                <Cell key={d.hour} fill={hourColor(d.hour)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
