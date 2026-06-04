import React from 'react'
import { Layers, Thermometer, Activity, Upload, Navigation, Info } from 'lucide-react'
import { useDashboard } from '../../context/DashboardContext'
import { SectionLabel, Toggle } from './ui'

const LAYER_DEFS = [
  {
    key: 'heatmap', label: 'Visitor Heatmap', color: '#EF4444', icon: Thermometer,
    info: 'Shows visit-density hotspots from filtered GPS points.',
  },
  {
    key: 'origins', label: 'Visitor Origin Tracking', color: '#06B6D4', icon: Navigation,
    info: 'Shows lines from visitor origin clusters to Simrishamn.',
  },
  {
    key: 'overtourism', label: 'Pressure Zones', color: '#F97316', icon: Activity,
    info: 'Displays predefined pressure polygons for sensitive areas.',
  },
  {
    key: 'clusters', label: 'Cluster View', color: '#38BDF8', icon: Layers,
    info: 'Aggregates nearby visits into count bubbles for quick scanning.',
  },
  {
    key: 'uploadedGeoJSON', label: 'Imported Layer', color: '#8B5CF6', icon: Upload,
    info: 'Shows custom uploaded GeoJSON overlays on the map.',
  },
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
        Map is locked to <span className="text-cyan-400 font-semibold">Simrishamn Heatmap</span> only.
      </div>

      <div className="space-y-2.5">
        {LAYER_DEFS.map(({ key, label, color, icon: Icon, info }) => (
          <div key={key} className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Icon size={13} style={{ color }} />
              <span className="text-xs text-slate-300 inline-flex items-center gap-1.5">
                {label}
                <span title={info} className="inline-flex items-center text-slate-500 hover:text-slate-300 cursor-help">
                  <Info size={11} />
                </span>
              </span>
            </div>
            <Toggle
              checked={activeLayers[key]}
              onChange={() => key === 'heatmap' && toggleLayer(key)}
              color={color}
              disabled={key !== 'heatmap'}
            />
          </div>
        ))}
      </div>
    </div>
  )
}
