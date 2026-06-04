import React from 'react'
import { Leaf } from 'lucide-react'
import { useDashboard } from '../../context/DashboardContext'
import { SectionLabel } from './ui'

const SEASONS = [
  { id: 'all',    label: 'All Year' },
  { id: 'spring', label: 'Spring' },
  { id: 'summer', label: 'Summer' },
  { id: 'autumn', label: 'Autumn' },
  { id: 'winter', label: 'Winter' },
]

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
                ? { backgroundColor: '#FF6B35', boxShadow: '0 4px 14px rgba(255,107,53,0.40)' }
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
