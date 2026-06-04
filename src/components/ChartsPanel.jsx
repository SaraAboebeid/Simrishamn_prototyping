import React from 'react'
import VisitorTrendChart   from './charts/VisitorTrendChart'
import MonthlyBarChart     from './charts/MonthlyBarChart'
import HourlyPatternChart  from './charts/HourlyPatternChart'
import DwellTimeChart      from './charts/DwellTimeChart'
import AttractionRankChart from './charts/AttractionRankChart'
import TourismRadarChart   from './charts/TourismRadarChart'

export default function ChartsPanel() {
  return (
    <div className="h-full bg-dash-900 grid grid-cols-3 grid-rows-2 gap-3 p-3 overflow-hidden">
      <VisitorTrendChart />
      <MonthlyBarChart />
      <HourlyPatternChart />
      <DwellTimeChart />
      <AttractionRankChart />
      <TourismRadarChart />
    </div>
  )
}
