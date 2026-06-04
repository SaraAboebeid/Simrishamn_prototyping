import React from 'react'
import { Leaf } from 'lucide-react'
import { useDashboard } from '../../context/DashboardContext'
import { SEASONS } from '../../data/simrishamnData'
import { SectionLabel } from './ui'

export default function SeasonFilter() {
  const { selectedSeason, setSelectedSeason } = useDashboard()

  return (
    <div>
      <SectionLabel>
        <span className="inline-flex items-center gap-1.5">
          <Leaf size={10} /> Season
        </span>
      </SectionLabel>

      <div className="grid grid-cols-2 gap-1.5">
        {SEASONS.map(s => {
          const active = selectedSeason === s.id
          return (
            <button
              key={s.id}
              onClick={() => setSelectedSeason(s.id)}
              className={`text-xs py-1.5 rounded-lg transition-all font-medium ${
                active
                  ? 'text-white'
                  : 'bg-dash-700 text-slate-400 hover:bg-dash-600 hover:text-slate-200'
              }`}
              style={active
                ? { backgroundColor: '#C8102E', boxShadow: '0 4px 14px rgba(200,16,46,0.40)' }
                : {}}
            >
              {s.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
