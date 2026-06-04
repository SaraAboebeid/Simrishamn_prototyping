import React from 'react'
import { Calendar } from 'lucide-react'
import { useDashboard } from '../../context/DashboardContext'
import { YEARS } from '../../data/simrishamnData'
import { SectionLabel } from './ui'

export default function YearSlider() {
  const { selectedYear, setSelectedYear } = useDashboard()

  return (
    <div className="panel-card">
      <SectionLabel>
        <span className="inline-flex items-center gap-1.5">
          <Calendar size={10} /> Year Filter
        </span>
      </SectionLabel>

      {/* tick labels */}
      <div className="flex justify-between text-[10px] text-slate-500 mb-1 px-0.5">
        {YEARS.map(y => (
          <span
            key={y}
            className="transition-colors"
            style={{ color: y === selectedYear ? '#FFCD00' : undefined, fontWeight: y === selectedYear ? 700 : 400 }}
          >
            {y}
          </span>
        ))}
      </div>

      <input
        type="range"
        min={YEARS[0]}
        max={YEARS[YEARS.length - 1]}
        step={1}
        value={selectedYear}
        onChange={e => setSelectedYear(Number(e.target.value))}
        className="w-full"
      />
    </div>
  )
}
