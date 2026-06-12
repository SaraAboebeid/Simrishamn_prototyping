import React, { useRef, useState } from 'react'
import { Upload, CheckCircle2, Loader2, AlertTriangle } from 'lucide-react'
import { useDashboard } from '../../context/DashboardContext'
import { convertSpatialUpload } from '../../utils/dataLoader'
import { SectionLabel } from './ui'

export default function ImportPanel() {
  const { applyImportedDatasets } = useDashboard()
  const fileRef = useRef(null)
  const [status, setStatus] = useState('idle')
  const [statusMsg, setStatusMsg] = useState('')
  const [summary, setSummary] = useState(null)
  const [stagedDatasets, setStagedDatasets] = useState(null)
  const [selectedName, setSelectedName] = useState('')

  async function handleFileUpload(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setSelectedName(file.name)
    setStatus('converting')
    setStatusMsg('Converting and parsing data...')
    setSummary(null)
    setStagedDatasets(null)

    try {
      const result = await convertSpatialUpload(file)
      setStagedDatasets(result.datasets)
      setSummary(result.summary)
      setStatus('converted')
      setStatusMsg('Data converted and parsed successfully')
    } catch (err) {
      setStatus('error')
      setStatusMsg(err?.message || 'Conversion failed')
    }

    if (fileRef.current) fileRef.current.value = ''
  }

  function handleApplyToDashboard() {
    if (!stagedDatasets) return
    applyImportedDatasets(stagedDatasets)
    setStatus('applied')
    setStatusMsg('Dashboard updated to the new dataset')
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
        accept=".geojson,.json,.gpkg"
        className="hidden"
        onChange={handleFileUpload}
      />

      <button
        onClick={() => {
          if (status === 'converting') return
          fileRef.current?.click()
        }}
        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-dashed border-dash-500 text-slate-400 text-xs transition-all hover:border-viz-violet hover:text-viz-violet hover:bg-viz-violet/5"
      >
        {status === 'converting' ? <Loader2 size={13} className="animate-spin" /> : <Upload size={13} />}
        {status === 'converting' ? 'Converting...' : 'Load GeoJSON / GeoPackage'}
      </button>

      {!!selectedName && (
        <div className="mt-2 text-[10px] text-slate-500 truncate" title={selectedName}>
          File: {selectedName}
        </div>
      )}

      {(status === 'converted' || status === 'applied') && (
        <div className="mt-2 p-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-[10px] text-emerald-300">
          <div className="flex items-center gap-1.5 mb-1">
            <CheckCircle2 size={12} />
            <span className="font-semibold">{statusMsg}</span>
          </div>
          {summary && (
            <div className="text-emerald-200/90 leading-relaxed">
              Stops: {summary.touristStopsFeatures} · Home DeSO: {summary.touristDesoFeatures} · Other layers: {summary.uploadedLayerCount}
            </div>
          )}
        </div>
      )}

      {status === 'error' && (
        <div className="mt-2 p-2 rounded-xl border border-amber-500/30 bg-amber-500/10 text-[10px] text-amber-200">
          <div className="flex items-center gap-1.5 font-semibold mb-0.5">
            <AlertTriangle size={12} />
            Conversion failed
          </div>
          <div className="leading-relaxed">{statusMsg}</div>
        </div>
      )}

      {(status === 'converted' || status === 'applied') && (
        <button
          onClick={handleApplyToDashboard}
          disabled={status === 'applied'}
          className="mt-2 w-full py-2 rounded-xl text-xs font-semibold transition-colors border border-cyan-500/40 bg-cyan-500/10 text-cyan-200 hover:bg-cyan-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {status === 'applied' ? 'Dashboard Updated' : 'Update Dashboard to New Data'}
        </button>
      )}

      <p className="text-[10px] text-slate-600 mt-1.5 leading-relaxed">
        Upload either <span className="text-slate-500">.geojson/.json</span> or <span className="text-slate-500">.gpkg</span>.
        GeoPackage conversion runs locally via Python, then you can apply it to the dashboard.
      </p>
    </div>
  )
}
