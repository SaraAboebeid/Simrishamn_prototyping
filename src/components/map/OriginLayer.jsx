/**
 * OriginLayer — draws source-derived arrows from municipality centroids to Simrishamn.
 * The GeoPackage provides municipality names, while this component maps those names
 * to real Sweden coordinates so we can render truthful arrows on the map.
 */
import React, { useEffect, useMemo, useRef } from 'react'
import { useMap } from 'react-leaflet'
import L from 'leaflet'
import { useDashboard } from '../../context/DashboardContext'

const SIMRISHAMN = [55.5567, 14.3542]

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

function buildOriginsFromFeatures(features) {
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
    .map(origin => ({
      label: origin.label,
      codes: Array.from(origin.codes),
      count: origin.count,
      point: origin.point,
    }))
    .sort((a, b) => {
      const aRank = priority.get(a.label) ?? 999
      const bRank = priority.get(b.label) ?? 999
      if (aRank !== bRank) return aRank - bRank
      return b.count - a.count || a.label.localeCompare(b.label)
    })
}

export default function OriginLayer() {
  const { touristOriginsData } = useDashboard()
  const map = useMap()
  const layerRef = useRef(null)

  const origins = useMemo(
    () => buildOriginsFromFeatures(touristOriginsData?.features),
    [touristOriginsData]
  )

  useEffect(() => {
    if (!map) return

    if (layerRef.current) {
      map.removeLayer(layerRef.current)
      layerRef.current = null
    }

    if (!origins.length) return

    const group = L.layerGroup()

    const getArrowIcon = () => L.divIcon({
      className: 'origin-arrowhead-icon',
      html: '<div style="width:0;height:0;border-left:10px solid #22D3EE;border-top:7px solid transparent;border-bottom:7px solid transparent;filter:drop-shadow(0 0 3px rgba(34, 211, 238, 0.7));"></div>',
      iconSize: [10, 14],
      iconAnchor: [0, 7],
    })

    origins.slice(0, 12).forEach(origin => {
      const [lat, lon] = origin.point
      const line = L.polyline([[lat, lon], SIMRISHAMN], {
        color: '#22D3EE',
        weight: 3.5,
        opacity: 0.92,
        className: 'origin-arrow-line',
      })

      const originMarker = L.circleMarker([lat, lon], {
        radius: 5,
        color: '#FB923C',
        fillColor: '#FB923C',
        fillOpacity: 0.95,
        weight: 2,
        className: 'origin-origin-marker',
      })

      const destinationMarker = L.marker(SIMRISHAMN, {
        icon: getArrowIcon(),
        interactive: false,
        title: `To Simrishamn from ${origin.label}`,
      })

      const popupHtml = `
        <div style="min-width:190px;font-size:11px;line-height:1.45;color:#0F172A;">
          <div style="font-weight:700;color:#0F172A;margin-bottom:2px;">Origin cluster</div>
          <div style="font-weight:700;color:#0891B2;margin-bottom:2px;">${origin.count} visits</div>
          <div style="font-weight:600;color:#1E293B;margin-bottom:2px;">${origin.label}</div>
          ${origin.codes?.length ? `<div style="color:#475569;margin-bottom:2px;">DeSO ${origin.codes.slice(0, 3).join(', ')}</div>` : ''}
        </div>`

      originMarker.bindPopup(popupHtml, { className: 'origin-popup-light' })
      originMarker.bindTooltip(
        `<div style="font-size:11px;color:#0F172A;font-weight:600;">${origin.label}</div>`,
        { direction: 'top', className: 'origin-tooltip-light' }
      )

      group.addLayer(line)
      group.addLayer(originMarker)
      group.addLayer(destinationMarker)
    })

    const simrishamn = L.circleMarker(SIMRISHAMN, {
      radius: 6,
      color: '#FF6B35',
      fillColor: '#FF6B35',
      fillOpacity: 0.95,
      weight: 2,
    })
    simrishamn.bindTooltip(
      '<div style="font-size:11px;color:#F1F5F9"><b style="color:#FF6B35">Simrishamn</b><br/>Destination</div>',
      { direction: 'top' }
    )
    group.addLayer(simrishamn)

    group.addTo(map)
    layerRef.current = group

    return () => {
      if (layerRef.current) {
        map.removeLayer(layerRef.current)
        layerRef.current = null
      }
    }
  }, [map, origins])

  return null
}
