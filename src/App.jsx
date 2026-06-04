import React from 'react'
import { DashboardProvider } from './context/DashboardContext'
import Sidebar     from './components/sidebar/Sidebar'
import MapView     from './components/map/MapView'
import ChartsPanel from './components/ChartsPanel'

export default function App() {
  return (
    <DashboardProvider>
      <div className="flex h-screen bg-dash-900 text-slate-100 overflow-hidden font-sans">
        <Sidebar />
        <main className="flex-1 flex flex-col overflow-hidden min-w-0">
          <div className="flex-none" style={{ height: '58%' }}>
            <MapView />
          </div>
          <div className="flex-1 min-h-0 overflow-hidden border-t border-dash-600">
            <ChartsPanel />
          </div>
        </main>
      </div>
    </DashboardProvider>
  )
}
