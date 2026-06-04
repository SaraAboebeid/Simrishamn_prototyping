import React from 'react'
import { Star } from 'lucide-react'
import { useDashboard } from '../../context/DashboardContext'
import { TOURISM_TYPES } from '../../data/simrishamnData'
import { SectionLabel } from './ui'

export default function TypeFilter() {
  const { selectedTypes, toggleType } = useDashboard()

  return (
    <div>
      <SectionLabel>
        <span className="inline-flex items-center gap-1.5">
          <Star size={10} /> Tourism Types
        </span>
      </SectionLabel>

      <div className="space-y-2">
        {TOURISM_TYPES.map(({ id, label, color, icon }) => {
          const active = selectedTypes.includes(id)
          return (
            <button
              key={id}
              onClick={() => toggleType(id)}
              className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg transition-all ${
                active ? 'bg-dash-700' : 'opacity-40'
              }`}
            >
              <span
                className="w-2.5 h-2.5 rounded-full flex-shrink-0 transition-all"
                style={{ backgroundColor: active ? color : '#475569' }}
              />
              <span className="text-xs text-slate-300 text-left flex-1">{label}</span>
              <span className="text-sm select-none">{icon}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
