import React from 'react'
import { Layers, Thermometer, Activity, Upload, Navigation } from 'lucide-react'
import { useDashboard } from '../../context/DashboardContext'
import { SectionLabel, Toggle } from './ui'

const LAYER_DEFS = [
  { key: 'heatmap',         label: 'Visitor Heatmap', color: '#EF4444', icon: Thermometer },
  { key: 'origins',         label: 'Visitor Origin Tracking', color: '#06B6D4', icon: Navigation  },
  { key: 'overtourism',     label: 'Pressure Zones',  color: '#F97316', icon: Activity    },
  { key: 'clusters',        label: 'Cluster View',    color: '#38BDF8', icon: Layers      },
  { key: 'uploadedGeoJSON', label: 'Imported Layer',  color: '#8B5CF6', icon: Upload      },
]

export default function LayerPanel() {
  const { activeLayers, toggleLayer } = useDashboard()

  return (
    <div>
      <SectionLabel>
        <span className="inline-flex items-center gap-1.5">
          <Layers size={10} /> Data Layers
        </span>
      </SectionLabel>

      <div className="text-[9px] text-slate-500 mb-2">
        Enable <span className="text-cyan-400 font-semibold">Visitor Origin Tracking</span> to show lines from visitor origins.
      </div>

      <div className="space-y-2.5">
        {LAYER_DEFS.map(({ key, label, color, icon: Icon }) => (
          <div key={key} className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Icon size={13} style={{ color }} />
              <span className="text-xs text-slate-300">{label}</span>
            </div>
            <Toggle checked={activeLayers[key]} onChange={() => toggleLayer(key)} color={color} />
          </div>
        ))}
      </div>
    </div>
  )
}
