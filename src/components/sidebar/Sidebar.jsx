import React from 'react'
import SidebarHeader from './SidebarHeader'
import YearSlider    from './YearSlider'
import LayerPanel    from './LayerPanel'
import StatsPanel    from './StatsPanel'
import ImportPanel   from './ImportPanel'
import { Divider }   from './ui'

export default function Sidebar() {
  return (
    <aside className="w-72 flex-shrink-0 flex flex-col bg-dash-800 border-r border-dash-600 overflow-y-auto">
      <SidebarHeader />

      <div className="flex-1 p-4 space-y-1">
        <LayerPanel />
        <Divider />
        <StatsPanel />
        <Divider />
        <ImportPanel />
      </div>

      <div className="px-4 pb-4 pt-2 text-[10px] leading-snug text-slate-400">
        <div className="border-t border-dash-600/80 pt-3 space-y-0.5">
          <div className="text-slate-500 uppercase tracking-wide">Urban Analytics team</div>
          <div className="flex flex-wrap gap-x-3 gap-y-0.5">
            <span>Flavia Lopez</span>
            <span>Sara Abouebeid</span>
          </div>
          <div className="flex flex-wrap gap-x-3 gap-y-0.5">
            <span>Elena Malakhatka</span>
            <span>Jorge Gil</span>
          </div>
        </div>
      </div>
    </aside>
  )
}
