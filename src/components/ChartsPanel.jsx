import React from 'react'
import VisitorTrendChart   from './charts/VisitorTrendChart'
import MonthlyBarChart     from './charts/MonthlyBarChart'
import HourlyPatternChart  from './charts/HourlyPatternChart'
import DwellTimeChart      from './charts/DwellTimeChart'

export default function ChartsPanel() {
  return (
    <div className="h-full bg-dash-900 grid grid-cols-4 gap-3 p-3 overflow-hidden">
      <VisitorTrendChart />
      <MonthlyBarChart />
      <HourlyPatternChart />
      <DwellTimeChart />
    </div>
  )
}
