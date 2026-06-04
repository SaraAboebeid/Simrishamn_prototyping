import React, { createContext, useContext, useState, useCallback } from 'react'

const DashboardContext = createContext(null)

export function DashboardProvider({ children }) {
  const [selectedYear,      setSelectedYear]      = useState(2023)
  const [selectedSeason,    setSelectedSeason]    = useState('all')
  const [selectedAttraction,setSelectedAttraction]= useState(null)
  const [uploadedLayers,    setUploadedLayers]    = useState([])

  const [activeLayers, setActiveLayers] = useState({
    attractions:    true,
    heatmap:        false,
    clusters:       false,
    overtourism:    false,
    uploadedGeoJSON:false,
  })

  const [selectedTypes, setSelectedTypes] = useState(
    ['cultural','nature','beach','food','events']
  )

  const toggleLayer = useCallback((key) =>
    setActiveLayers(prev => ({ ...prev, [key]: !prev[key] })), [])

  const toggleType = useCallback((type) =>
    setSelectedTypes(prev =>
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    ), [])

  const addUploadedLayer = useCallback((layer) =>
    setUploadedLayers(prev => [...prev, layer]), [])

  return (
    <DashboardContext.Provider value={{
      selectedYear,       setSelectedYear,
      selectedSeason,     setSelectedSeason,
      selectedAttraction, setSelectedAttraction,
      activeLayers,       toggleLayer,
      selectedTypes,      toggleType,
      uploadedLayers,     addUploadedLayer,
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
