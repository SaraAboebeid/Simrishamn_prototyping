import React, { useState } from 'react'
import { TrendingUp, BarChart2, Clock, Timer } from 'lucide-react'
import VisitorTrendChart   from './charts/VisitorTrendChart'
import MonthlyBarChart     from './charts/MonthlyBarChart'
import HourlyPatternChart  from './charts/HourlyPatternChart'
import DwellTimeChart      from './charts/DwellTimeChart'
import DateTimeFilter      from './sidebar/DateTimeFilter'

const CHART_TABS = [
  { id: 'trend',   label: 'Visitor Trend',  icon: TrendingUp, component: VisitorTrendChart,  accent: '#06B6D4' },
  { id: 'monthly', label: 'Monthly',        icon: BarChart2,  component: MonthlyBarChart,    accent: '#FF6B35' },
  { id: 'hourly',  label: 'Hourly Pattern', icon: Clock,      component: HourlyPatternChart, accent: '#8B5CF6' },
  { id: 'dwell',   label: 'Dwell Time',     icon: Timer,      component: DwellTimeChart,     accent: '#F59E0B' },
]

export default function ChartsPanel() {
  const [activeId, setActiveId] = useState('trend')
  const [filterOpen, setFilterOpen] = useState(false)
  const active = CHART_TABS.find(t => t.id === activeId)
  const ActiveChart = active.component

  return (
    <div className="h-full bg-dash-900 flex overflow-hidden">
      {/* ── Active chart ─────────────────────────────────────── */}
      <div className="flex-1 min-w-0 p-3 flex flex-col gap-3">
        <DateTimeFilter
          variant="chart"
          collapsed={!filterOpen}
          onToggle={() => setFilterOpen(prev => !prev)}
        />
        <div className="flex-1 min-h-0">
          <ActiveChart />
        </div>
      </div>

      {/* ── Chart selector sidebar ───────────────────────────── */}
      <div className="w-32 flex-shrink-0 border-l border-dash-600 flex flex-col py-3 px-2 gap-1">
        <div className="text-[9px] font-bold text-slate-500 uppercase tracking-widest px-2 mb-1.5">
          Charts
        </div>
        {CHART_TABS.map(tab => {
          const isActive = tab.id === activeId
          return (
            <button
              key={tab.id}
              onClick={() => setActiveId(tab.id)}
              className="flex items-center gap-2 px-2 py-2.5 rounded-xl text-left transition-all"
              style={{
                background: isActive ? `${tab.accent}18` : 'transparent',
                border: isActive ? `1px solid ${tab.accent}55` : '1px solid transparent',
              }}
            >
              <tab.icon
                size={13}
                style={{ color: isActive ? tab.accent : '#475569', flexShrink: 0 }}
              />
              <span
                className="text-[10px] font-semibold leading-tight"
                style={{ color: isActive ? '#e2e8f0' : '#64748B' }}
              >
                {tab.label}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
