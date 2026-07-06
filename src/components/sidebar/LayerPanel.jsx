import React from 'react'
import { Layers, Thermometer, Activity, Upload, Navigation, Info, MapPin } from 'lucide-react'
import { useDashboard } from '../../context/DashboardContext'
import { SectionLabel, Toggle } from './ui'

const LAYER_DEFS = [
  {
    key: 'heatmap', label: 'Visitor Heatmap', color: '#EF4444', icon: Thermometer,
    info: 'Shows visit-density hotspots from filtered GPS points.',
  },
  {
    key: 'touristStops', label: 'Tourist Stops', color: '#EC4899', icon: MapPin,
    info: 'All stops >10 min within the sample area made by the 882 identified visitor devices.',
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

      <div className="space-y-2.5">
        {LAYER_DEFS.map(({ key, label, color, icon: Icon, info }) => (
          <div key={key} className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Icon size={13} style={{ color: activeLayers[key] ? color : '#475569' }} />
              <span className="text-xs text-slate-300 inline-flex items-center gap-1.5">
                {label}
                <span className="relative inline-flex items-center group">
                  <button
                    type="button"
                    className="inline-flex items-center text-slate-500 hover:text-slate-300 cursor-help"
                    aria-label={`Info: ${label}`}
                  >
                    <Info size={11} />
                  </button>
                  <span
                    role="tooltip"
                    className="pointer-events-none absolute left-1/2 top-full z-20 mt-1 -translate-x-1/2 whitespace-normal w-44 rounded-lg border border-dash-600 bg-dash-900 px-2 py-1 text-[9px] leading-snug text-slate-300 opacity-0 shadow-xl transition-opacity duration-150 group-hover:opacity-100 group-focus-within:opacity-100"
                  >
                    {info}
                  </span>
                </span>
              </span>
            </div>
            <Toggle
              checked={activeLayers[key]}
              onChange={() => toggleLayer(key)}
              color={color}
            />
          </div>
        ))}
      </div>
    </div>
  )
}
