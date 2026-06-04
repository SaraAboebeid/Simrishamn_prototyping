import React from 'react'
import VisitorTrendChart  from './charts/VisitorTrendChart'
import MonthlyBarChart    from './charts/MonthlyBarChart'
import TourismRadarChart  from './charts/TourismRadarChart'
import AttractionRankChart from './charts/AttractionRankChart'

export default function ChartsPanel() {
  return (
    <div className="h-full bg-dash-900 grid grid-cols-4 gap-3 p-3 overflow-hidden">
      <VisitorTrendChart />
      <MonthlyBarChart />
      <TourismRadarChart />
      <AttractionRankChart />
    </div>
  )
}
