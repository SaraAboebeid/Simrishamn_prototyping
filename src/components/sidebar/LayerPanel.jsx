import React from 'react'
import { Layers, Map, Thermometer, Activity, Upload } from 'lucide-react'
import { useDashboard } from '../../context/DashboardContext'
import { SectionLabel, Toggle } from './ui'

const LAYER_DEFS = [
  { key: 'attractions',     label: 'Attractions',     color: '#FFCD00', icon: Map         },
  { key: 'heatmap',         label: 'Visitor Heatmap', color: '#C8102E', icon: Thermometer },
  { key: 'overtourism',     label: 'Pressure Zones',  color: '#F97316', icon: Activity    },
  { key: 'clusters',        label: 'Cluster View',    color: '#4169C8', icon: Layers      },
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
