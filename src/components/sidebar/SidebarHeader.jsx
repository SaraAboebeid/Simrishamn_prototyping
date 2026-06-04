import React from 'react'
import { useDashboard } from '../../context/DashboardContext'
import { yearlyStats } from '../../data/simrishamnData'
import { GRADIENT } from '../../theme/colors'

export default function SidebarHeader() {
  const { selectedYear } = useDashboard()
  const stats    = yearlyStats[selectedYear]
  const prev     = yearlyStats[selectedYear - 1]
  const growthPct = prev
    ? (((stats.total - prev.total) / prev.total) * 100).toFixed(1)
    : null

  return (
    <div className="flex-shrink-0 p-4 pb-5" style={{ background: GRADIENT.header }}>
      {/* Logo row */}
      <div className="flex items-center gap-3">
        <div className="text-3xl select-none">⛵</div>
        <div>
          <div className="font-bold text-white tracking-[0.12em] text-sm uppercase leading-tight">
            Simrishamn
          </div>
          <div className="text-white/75 text-[11px] leading-tight">
            Tourism Analytics · Skåne
          </div>
        </div>
      </div>

      {/* Year + growth badge */}
      <div className="mt-3 flex items-center gap-2">
        <div className="text-xs font-semibold text-white/90 bg-white/20 rounded-full px-3 py-0.5 backdrop-blur-sm">
          {selectedYear}
        </div>
        {growthPct && (
          <div
            className={`text-xs font-semibold rounded-full px-2 py-0.5 backdrop-blur-sm ${
              Number(growthPct) >= 0
                ? 'bg-yellow-400/20 text-yellow-200'
                : 'bg-red-400/20 text-red-200'
            }`}
          >
            {Number(growthPct) >= 0 ? '▲' : '▼'} {Math.abs(growthPct)}%
          </div>
        )}
      </div>
    </div>
  )
}
