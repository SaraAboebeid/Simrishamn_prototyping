import React, { useState } from 'react'
import { Info, ChevronDown, ChevronUp } from 'lucide-react'
import { SectionLabel } from './ui'

export default function DataInfoPanel() {
  const [open, setOpen] = useState(true)

  return (
    <div>
      <SectionLabel>
        <span className="inline-flex items-center justify-between w-full">
          <span className="inline-flex items-center gap-1.5">
            <Info size={10} /> Dataset Info
          </span>
          <button
            onClick={() => setOpen(p => !p)}
            className="text-slate-500 hover:text-slate-300 transition-colors"
            aria-label="Toggle dataset info"
          >
            {open ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
          </button>
        </span>
      </SectionLabel>

      {open && (
        <div className="space-y-2.5">
          {/* Methodology */}
          <div className="p-2.5 bg-dash-700 rounded-xl border border-dash-600 text-[10px] text-slate-400 space-y-1.5">
            <p className="text-slate-200 font-semibold text-[11px]">Sample methodology</p>
            <ul className="space-y-1.5 list-none">
              <li className="leading-relaxed">Generated stops, home locations, and work locations for devices within the study area.</li>
              <li className="leading-relaxed">Identified devices whose home location is <span className="text-slate-300">outside Simrishamn</span> but that had other activities recorded within Simrishamn.</li>
              <li className="leading-relaxed">This resulted in <span className="text-cyan-400 font-semibold">882 unique devices</span> in this sample.</li>
              <li className="leading-relaxed">Extracted all stops within the sample area associated with those devices.</li>
            </ul>
          </div>

          {/* Dataset descriptions */}
          <div className="p-2.5 bg-dash-700 rounded-xl border border-dash-600 text-[10px] text-slate-400">
            <p className="font-semibold text-slate-200 mb-0.5">
              <span style={{ color: '#10B981' }}>tourist_stops_10min</span>
            </p>
            <p className="leading-relaxed">All stops (&gt;10 min) within the sample area made by the 882 identified devices. Gives an initial picture of movement patterns.</p>
          </div>

          <div className="p-2.5 bg-dash-700 rounded-xl border border-dash-600 text-[10px] text-slate-400">
            <p className="font-semibold text-slate-200 mb-0.5">
              <span style={{ color: '#A78BFA' }}>tourists_home_deso</span>
            </p>
            <p className="leading-relaxed">The DeSO area associated with each device's home location — gives an overview of where visitors are coming from.</p>
          </div>
        </div>
      )}
    </div>
  )
}
