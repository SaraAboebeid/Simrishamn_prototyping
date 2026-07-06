import React, { useEffect, useMemo, useRef } from 'react'
import { MapContainer, TileLayer, useMap } from 'react-leaflet'
import L from 'leaflet'
import { useDashboard } from '../../context/DashboardContext'
import MapLegend          from './MapLegend'
import HeatmapLayer       from './HeatmapLayer'
import OriginLayer        from './OriginLayer'
import OvertourismLayer   from './OvertourismLayer'
import ClusterLayer       from './ClusterLayer'
import TouristStopsLayer  from './TouristStopsLayer'

// Fix Leaflet default icon paths for Vite
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconUrl:       new URL('leaflet/dist/images/marker-icon.png',    import.meta.url).href,
  iconRetinaUrl: new URL('leaflet/dist/images/marker-icon-2x.png', import.meta.url).href,
  shadowUrl:     new URL('leaflet/dist/images/marker-shadow.png',  import.meta.url).href,
})

// Simrishamn town centre
const TOWN_CENTER = [55.5567, 14.3523]
const TOWN_ZOOM   = 13

const MUNICIPALITY_POINTS = {
  'Ale': [57.9297, 12.0670],
  'Borlänge': [60.4858, 15.4371],
  'Borås': [57.7210, 12.9401],
  'Ekerö': [59.2889, 17.8124],
  'Göteborg': [57.7089, 11.9746],
  'Halmstad': [56.6745, 12.8578],
  'Helsingborg': [56.0465, 12.6945],
  'Huddinge': [59.2360, 17.9810],
  'Järfälla': [59.4234, 17.8340],
  'Karlskrona': [56.1612, 15.5869],
  'Kiruna': [67.8558, 20.2253],
  'Kristianstad': [56.0313, 14.1524],
  'Kungsbacka': [57.4870, 12.0760],
  'Linköping': [58.4108, 15.6214],
  'Lund': [55.7047, 13.1910],
  'Malmö': [55.6050, 13.0038],
  'Norrköping': [58.5877, 16.1924],
  'Stockholm': [59.3293, 18.0686],
  'Trelleborg': [55.3751, 13.1569],
  'Uppsala': [59.8586, 17.6389],
  'Västerås': [59.6099, 16.5448],
  'Växjö': [56.8790, 14.8059],
  'Örebro': [59.2753, 15.2134],
}

const MUNICIPALITY_ALIASES = {
  gothenburg: 'Göteborg',
  malmo: 'Malmö',
}

function normalizeName(value = '') {
  return String(value).trim().toLowerCase().replace(/\s+/g, ' ')
}

function getMunicipalityPoint(name) {
  const raw = String(name ?? '')
  const decoded = (() => {
    try {
      return decodeURIComponent(raw)
    } catch {
      return raw
    }
  })()
  const alias = MUNICIPALITY_ALIASES[normalizeName(decoded)] ?? decoded
  return MUNICIPALITY_POINTS[alias] ?? MUNICIPALITY_POINTS[decoded] ?? null
}

function buildOriginPoints(features) {
  if (!features?.length) return []

  const grouped = new Map()

  features.forEach(feature => {
    const properties = feature.properties ?? {}
    const municipality = properties.kommunnamn_home ?? properties.kommunnamn_other ?? properties.origin_label ?? 'Origin'
    const code = properties.desokod_home ?? properties.desokod_other ?? null
    const count = Number(properties.count ?? properties.unique_devices ?? properties.device_count ?? 0)
    const safeCount = Number.isFinite(count) && count > 0 ? count : 0
    const label = String(municipality)

    const existing = grouped.get(label) ?? {
      label,
      codes: new Set(),
      count: 0,
      point: getMunicipalityPoint(municipality),
    }

    existing.count += safeCount
    if (code) existing.codes.add(String(code))
    grouped.set(label, existing)
  })

  const priority = new Map([
    ['Stockholm', 0],
    ['Malmö', 1],
    ['Göteborg', 2],
    ['Gothenburg', 2],
  ])

  return Array.from(grouped.values())
    .filter(origin => origin.point)
    .sort((a, b) => {
      const aRank = priority.get(a.label) ?? 999
      const bRank = priority.get(b.label) ?? 999
      if (aRank !== bRank) return aRank - bRank
      return b.count - a.count || a.label.localeCompare(b.label)
    })
    .slice(0, 12)
}

function OriginAutoFit() {
  const map = useMap()
  const { activeLayers, touristOriginsData, touristDesoData } = useDashboard()
  const prevOriginsActive = useRef(false)

  const origins = useMemo(() => {
    if (touristOriginsData?.features?.length) {
      return buildOriginPoints(touristOriginsData.features)
    }

    if (!touristDesoData?.features) return []
    const grouped = new Map()

    touristDesoData.features.forEach(feature => {
      const p = feature.properties ?? {}
      const label = p.kommunnamn_home ?? p.kommunnamn_other ?? p.origin_label ?? 'Origin'
      const code = p.desokod_home ?? p.desokod_other ?? null
      const point = getMunicipalityPoint(label)
      if (!point) return
      const count = Number(p.count ?? p.unique_devices ?? p.device_count ?? 0)
      const safeCount = Number.isFinite(count) && count > 0 ? count : 0

      const existing = grouped.get(String(label)) ?? {
        label: String(label),
        codes: new Set(),
        count: 0,
        point,
      }

      existing.count += safeCount
      if (code) existing.codes.add(String(code))
      grouped.set(String(label), existing)
    })

    return Array.from(grouped.values()).sort((a, b) => b.count - a.count || a.label.localeCompare(b.label)).slice(0, 12)
  }, [touristOriginsData, touristDesoData])

  useEffect(() => {
    const justEnabled = activeLayers.origins && !prevOriginsActive.current
    const justDisabled = !activeLayers.origins && prevOriginsActive.current
    prevOriginsActive.current = activeLayers.origins

    if (justEnabled && origins.length) {
      const points = [TOWN_CENTER, ...origins.map(origin => origin.point)]
      const bounds = L.latLngBounds(points)

      map.flyToBounds(bounds, {
        padding: [40, 40],
        maxZoom: 11,
        duration: 1.1,
      })
      return
    }

    if (justDisabled) {
      map.flyTo(TOWN_CENTER, TOWN_ZOOM, {
        animate: true,
        duration: 1.1,
        easeLinearity: 0.25,
      })
    }
  }, [activeLayers.origins, map, origins])

  return null
}

export default function MapView() {
  const { activeLayers } = useDashboard()

  return (
    <div style={{ height: '100%', width: '100%', position: 'relative' }}>
      <MapLegend />

      <MapContainer
        center={TOWN_CENTER}
        zoom={TOWN_ZOOM}
        style={{ height: '100%', width: '100%' }}
        zoomControl={false}
        minZoom={0}
      >
        {/* CartoDB Dark Matter — uses OSM data with Skåne-friendly dark style */}
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          maxZoom={19}
        />

        <OriginAutoFit />

        {activeLayers.heatmap     && <HeatmapLayer />}
        {activeLayers.origins     && <OriginLayer />}
        {activeLayers.overtourism && <OvertourismLayer />}
        {activeLayers.clusters    && <ClusterLayer />}
        {activeLayers.touristStops && <TouristStopsLayer />}
      </MapContainer>
    </div>
  )
}
