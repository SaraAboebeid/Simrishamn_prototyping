import React, { useRef } from 'react'
import { Upload } from 'lucide-react'
import { useDashboard } from '../../context/DashboardContext'
import { parseGeoJSON } from '../../utils/dataLoader'
import { SectionLabel } from './ui'

export default function ImportPanel() {
  const { addUploadedLayer, toggleLayer } = useDashboard()
  const fileRef = useRef(null)

  async function handleFileUpload(e) {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const geo = await parseGeoJSON(file)
      addUploadedLayer({ name: file.name, data: geo })
      toggleLayer('uploadedGeoJSON')
    } catch {
      alert(
        'Could not parse file. Please use GeoJSON format.\n' +
        'Convert with geopandas: df.to_file("out.geojson", driver="GeoJSON")'
      )
    }
  }

  return (
    <div>
      <SectionLabel>
        <span className="inline-flex items-center gap-1.5">
          <Upload size={10} /> Import Spatial Data
        </span>
      </SectionLabel>

      <input
        ref={fileRef}
        type="file"
        accept=".geojson,.json"
        className="hidden"
        onChange={handleFileUpload}
      />

      <button
        onClick={() => fileRef.current?.click()}
        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-dashed border-dash-500 text-slate-400 text-xs transition-all hover:border-viz-violet hover:text-viz-violet hover:bg-viz-violet/5"
      >
        <Upload size={13} />
        Load GeoJSON / GeoPackage
      </button>

      <p className="text-[10px] text-slate-600 mt-1.5 leading-relaxed">
        Convert .gpkg → GeoJSON with geopandas:<br />
        <code className="text-slate-500">df.to_crs(4326).to_file("out.geojson")</code>
      </p>
    </div>
  )
}
