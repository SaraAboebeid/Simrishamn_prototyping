import React, { createContext, useContext, useState, useCallback, useEffect, useMemo } from 'react'
import { filterVisits } from '../data/visitDataLoader'

// Convert a "HH:MM:SS" duration string to minutes
function parseDurationMin(str) {
  if (!str) return 0
  const parts = str.split(':').map(Number)
  return parts[0] * 60 + (parts[1] || 0) + (parts[2] || 0) / 60
}

// Transform tourist stop GeoJSON features into the visit record format
// expected by all charts/KPIs: { uid, lat, lon, date, month, day, startHour, dow, dwellMin }
function stopsToVisits(geojson) {
  if (!geojson?.features) return []
  return geojson.features
    .filter(f => f.geometry?.type === 'Point' && f.properties?.start_time)
    .map(f => {
      const p = f.properties
      const [lon, lat] = f.geometry.coordinates
      const dt = new Date(p.start_time)
      return {
        uid:       p.device_uid,
        lat,
        lon,
        date:      dt.toISOString().slice(0, 10),
        month:     dt.getMonth() + 1,
        day:       dt.getDate(),
        startHour: dt.getHours(),
        dow:       (dt.getDay() + 6) % 7,   // Mon=0 … Sun=6
        dwellMin:  parseDurationMin(p.duration),
      }
    })
}

const DashboardContext = createContext(null)

export function DashboardProvider({ children }) {
  // ── Legacy state (kept for mock-data charts) ──────────────────
  const [selectedYear,      setSelectedYear]      = useState(2024)
  const [selectedAttraction,setSelectedAttraction]= useState(null)
  const [uploadedLayers,    setUploadedLayers]    = useState([])

  const [activeLayers, setActiveLayers] = useState({
    heatmap:        true,
    clusters:       false,
    overtourism:    false,
    origins:        false,
    uploadedGeoJSON:false,
    touristStops:   true,
    touristDeso:    false,
  })

  const [selectedTypes, setSelectedTypes] = useState(
    ['cultural','nature','beach','food','events']
  )

  // ── Real data & filter state ──────────────────────────────────
  const [allVisits,   setAllVisits]   = useState([])
  const [visitMeta,   setVisitMeta]   = useState(null)
  const [dataLoaded,  setDataLoaded]  = useState(false)

  // Time filter
  const [hourFrom, setHourFrom] = useState(0)
  const [hourTo,   setHourTo]   = useState(23)

  // Date range
  const [dateFrom, setDateFrom] = useState(null)
  const [dateTo,   setDateTo]   = useState(null)

  // Period mode: 'all' | 'month' | 'season' | 'holiday' | 'longweekend'
  const [periodMode,   setPeriodMode]   = useState('all')
  const [selectedMonths, setSelectedMonths] = useState([])   // 1-12
  const [selectedSeason, setSelectedSeason] = useState(null) // 'summer' etc.
  const [selectedPeriod, setSelectedPeriod] = useState(null) // holiday/lw key

  // Derived filtered visits (recomputed on filter change)
  const [filteredVisits, setFilteredVisits] = useState([])

  // ── Tourist GPS layer data ─────────────────────────────────────
  const [touristStopsData, setTouristStopsData] = useState(null)
  const [touristDesoData,  setTouristDesoData]  = useState(null)

  useEffect(() => {
    fetch('/data/tourists_stops_10min.geojson')
      .then(r => r.json())
      .then(setTouristStopsData)
      .catch(err => console.error('Failed to load tourist stops:', err))
    fetch('/data/tourists_home_deso.geojson')
      .then(r => r.json())
      .then(setTouristDesoData)
      .catch(err => console.error('Failed to load tourist DeSO:', err))
  }, [])

  // Derive visits from real GPS stop data once it loads
  useEffect(() => {
    if (!touristStopsData) return
    const visits = stopsToVisits(touristStopsData)
    setAllVisits(visits)
    setFilteredVisits(visits)
    setDataLoaded(true)
  }, [touristStopsData])

  // Refilter whenever any filter changes
  useEffect(() => {
    if (!allVisits.length) return
    const filtered = filterVisits(allVisits, {
      dateFrom:  periodMode === 'date' ? dateFrom : null,
      dateTo:    periodMode === 'date' ? dateTo   : null,
      months:    periodMode === 'month'   ? selectedMonths : null,
      seasonKey: periodMode === 'season'  ? selectedSeason : null,
      periodKey: (periodMode === 'holiday' || periodMode === 'longweekend') ? selectedPeriod : null,
      hourFrom,
      hourTo,
    })
    setFilteredVisits(filtered)
  }, [allVisits, dateFrom, dateTo, periodMode, selectedMonths, selectedSeason, selectedPeriod, hourFrom, hourTo])

  const toggleLayer = useCallback((key) => {
    setActiveLayers(prev => ({ ...prev, [key]: !prev[key] }))
  }, [])

  const toggleType = useCallback((type) =>
    setSelectedTypes(prev =>
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    ), [])

  const addUploadedLayer = useCallback((layer) =>
    setUploadedLayers(prev => [...prev, layer]), [])

  const applyImportedDatasets = useCallback((datasets) => {
    if (!datasets) return

    if (datasets.touristStops) {
      setTouristStopsData(datasets.touristStops)
      setActiveLayers(prev => ({
        ...prev,
        touristStops: true,
        heatmap: true,
      }))
    }

    if (datasets.touristDeso) {
      setTouristDesoData(datasets.touristDeso)
    }

    if (datasets.uploadedLayers?.length) {
      setUploadedLayers(prev => [...prev, ...datasets.uploadedLayers])
      setActiveLayers(prev => ({
        ...prev,
        uploadedGeoJSON: true,
      }))
    }
  }, [])

  const toggleMonth = useCallback((m) =>
    setSelectedMonths(prev =>
      prev.includes(m) ? prev.filter(x => x !== m) : [...prev, m]
    ), [])

  return (
    <DashboardContext.Provider value={{
      // legacy
      selectedYear,       setSelectedYear,
      selectedAttraction, setSelectedAttraction,
      activeLayers,       toggleLayer,
      selectedTypes,      toggleType,
      uploadedLayers,     addUploadedLayer,
      applyImportedDatasets,
      // tourist GPS layers
      touristStopsData,
      touristDesoData,
      // real data
      allVisits, filteredVisits, visitMeta, dataLoaded,
      // filters
      hourFrom, setHourFrom,
      hourTo,   setHourTo,
      dateFrom, setDateFrom,
      dateTo,   setDateTo,
      periodMode,    setPeriodMode,
      selectedMonths, toggleMonth, setSelectedMonths,
      selectedSeason, setSelectedSeason,
      selectedPeriod, setSelectedPeriod,
    }}>
      {children}
    </DashboardContext.Provider>
  )
}

export function useDashboard() {
  const ctx = useContext(DashboardContext)
  if (!ctx) throw new Error('useDashboard must be used within DashboardProvider')
  return ctx
}
