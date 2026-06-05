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
    </aside>
  )
}
