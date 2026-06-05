import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { loadVisitData, filterVisits } from '../data/visitDataLoader'

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

  // Load data once
  useEffect(() => {
    loadVisitData().then(data => {
      setAllVisits(data.visits)
      setVisitMeta(data.meta)
      setFilteredVisits(data.visits)
      setDataLoaded(true)
    })
  }, [])

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
