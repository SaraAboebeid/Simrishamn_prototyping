import React, { useMemo } from 'react'
import { useDashboard } from '../../context/DashboardContext'
import { GRADIENT } from '../../theme/colors'

export default function SidebarHeader() {
  const { filteredVisits, allVisits } = useDashboard()

  const uniqueFiltered = useMemo(() => {
    const uids = new Set(filteredVisits.map(v => v.uid))
    return uids.size
  }, [filteredVisits])

  const uniqueAll = useMemo(() => {
    const uids = new Set((allVisits || []).map(v => v.uid))
    return uids.size
  }, [allVisits])

  const pct = uniqueAll > 0
    ? Math.round((uniqueFiltered / uniqueAll) * 100)
    : 100

  return (
    <div className="flex-shrink-0 p-4 pb-5" style={{ background: GRADIENT.header }}>
      {/* Logo row */}
      <div className="flex items-center gap-3">
        <div className="text-3xl select-none">⛵</div>
        <div>
          <div className="font-bold text-white tracking-[0.12em] text-sm uppercase leading-tight">
            Visitation Analysis
          </div>
          <div className="text-white/75 text-[11px] leading-tight">
            Tourist Analytics. GPS Data
          </div>
          <div className="text-white/60 text-[10px] leading-tight mt-0.5">
            Urban Analytics Lab
          </div>
        </div>
      </div>

      {/* Visitor count badge */}
      <div className="mt-3 flex items-center gap-2">
        <div className="text-xs font-semibold text-white/90 bg-white/20 rounded-full px-3 py-0.5 backdrop-blur-sm">
          {uniqueFiltered.toLocaleString()} visitors
        </div>
        <div className="text-xs font-semibold rounded-full px-2 py-0.5 backdrop-blur-sm bg-cyan-400/20 text-cyan-200">
          {uniqueFiltered} unique
        </div>
        {pct < 100 && (
          <div className="text-xs font-semibold rounded-full px-2 py-0.5 backdrop-blur-sm bg-amber-400/20 text-amber-200">
            {pct}%
          </div>
        )}
      </div>
    </div>
  )
}
