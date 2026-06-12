/**
 * OriginLayer — draws "spider / desire lines" from visitor home locations
 * to the Simrishamn area centre, with thickness proportional to count.
 * Uses raw SVG overlay via Leaflet's createPane / SVGOverlay approach.
 */
import React, { useMemo, useEffect, useRef } from 'react'
import { useMap } from 'react-leaflet'
import L from 'leaflet'
import { useDashboard } from '../../context/DashboardContext'

const CTR = [55.5567, 14.3542]   // Simrishamn centre [lat, lon]

const SWEDEN_PLACES = [
  { name: 'Stockholm', type: 'city', lat: 59.3293, lon: 18.0686 },
  { name: 'Gothenburg', type: 'city', lat: 57.7089, lon: 11.9746 },
  { name: 'Malmo', type: 'city', lat: 55.6050, lon: 13.0038 },
  { name: 'Uppsala', type: 'city', lat: 59.8586, lon: 17.6389 },
  { name: 'Vasteras', type: 'city', lat: 59.6099, lon: 16.5448 },
  { name: 'Orebro', type: 'city', lat: 59.2753, lon: 15.2134 },
  { name: 'Linkoping', type: 'city', lat: 58.4108, lon: 15.6214 },
  { name: 'Helsingborg', type: 'city', lat: 56.0465, lon: 12.6945 },
  { name: 'Jonkoping', type: 'city', lat: 57.7826, lon: 14.1618 },
  { name: 'Norrkoping', type: 'city', lat: 58.5877, lon: 16.1924 },
  { name: 'Lund', type: 'city', lat: 55.7047, lon: 13.1910 },
  { name: 'Umea', type: 'city', lat: 63.8258, lon: 20.2630 },
  { name: 'Lulea', type: 'city', lat: 65.5848, lon: 22.1547 },
  { name: 'Kalmar', type: 'city', lat: 56.6634, lon: 16.3568 },
  { name: 'Ystad Municipality', type: 'municipality', lat: 55.4295, lon: 13.8204 },
  { name: 'Tomelilla Municipality', type: 'municipality', lat: 55.5422, lon: 13.9543 },
  { name: 'Sjoebo Municipality', type: 'municipality', lat: 55.6314, lon: 13.7061 },
  { name: 'Kristianstad Municipality', type: 'municipality', lat: 56.0294, lon: 14.1567 },
  { name: 'Simrishamn Municipality', type: 'municipality', lat: 55.5567, lon: 14.3500 },
]

function distanceKm(lat1, lon1, lat2, lon2) {
  const toRad = deg => (deg * Math.PI) / 180
  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2
  return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

function inferPlaceLabel(lat, lon) {
  const nearestMunicipality = SWEDEN_PLACES
    .filter(p => p.type === 'municipality')
    .map(p => ({
      ...p,
      km: distanceKm(lat, lon, p.lat, p.lon),
    }))
    .sort((a, b) => a.km - b.km)[0]

  if (nearestMunicipality && nearestMunicipality.km <= 35) {
    return `Municipality: ${nearestMunicipality.name}`
  }

  let best = SWEDEN_PLACES[0]
  let bestKm = Number.POSITIVE_INFINITY

  SWEDEN_PLACES.forEach(place => {
    const km = distanceKm(lat, lon, place.lat, place.lon)
    if (km < bestKm) {
      best = place
      bestKm = km
    }
  })

  const prefix = best.type === 'municipality' ? 'Municipality' : 'Near'
  return `${prefix}: ${best.name}`
}

// Derive origin clusters from touristDesoData home polygons
function buildOriginsFromDeso(desoData) {
  if (!desoData?.features) return []
  const munis = {}
  desoData.features.forEach(f => {
    const p = f.properties ?? {}
    const name = p.kommunnamn_home
    const lat  = p.centroid_lat
    const lon  = p.centroid_lon
    if (!name || lat == null || lon == null) return
    if (!munis[name]) munis[name] = { lat, lon, count: 0 }
    munis[name].count++
  })
  return Object.values(munis)
}

export default function OriginLayer() {
  const { touristDesoData } = useDashboard()
  const map    = useMap()
  const svgRef = useRef(null)

  const origins  = useMemo(() => buildOriginsFromDeso(touristDesoData), [touristDesoData])
  const maxCount = useMemo(() => Math.max(...origins.map(o => o.count), 1), [origins])

  useEffect(() => {
    if (!map || !origins.length) return

    // Remove previous SVG overlay
    if (svgRef.current) {
      map.removeLayer(svgRef.current)
      svgRef.current = null
    }

    // Build Leaflet polylines for each origin cluster
    const group = L.layerGroup()

    origins.forEach(origin => {
      const intensity = Math.sqrt(origin.count / maxCount)
      const weight = 0.8 + intensity * 5.2
      const opacity = 0.18 + intensity * 0.58

      const line = L.polyline(
        [[origin.lat, origin.lon], CTR],
        {
          color:   '#06B6D4',
          weight,
          opacity,
          dashArray: null,
        }
      )

      // Circle at origin point
      const circle = L.circleMarker([origin.lat, origin.lon], {
        radius:      1.5 + intensity * 4.5,
        color:       '#06B6D4',
        fillColor:   '#06B6D4',
        fillOpacity: 0.7,
        weight:      1,
      })
      const placeLabel = inferPlaceLabel(origin.lat, origin.lon)
      const popupHtml = `
        <div style="min-width:190px;font-size:11px;line-height:1.45;color:#0F172A;">
          <div style="font-weight:700;color:#0F172A;margin-bottom:2px;">Origin cluster</div>
          <div style="font-weight:700;color:#0891B2;margin-bottom:2px;">${origin.count} visits</div>
          <div style="font-weight:600;color:#1E293B;margin-bottom:2px;">${placeLabel}</div>
          <div style="color:#475569;">${origin.lat.toFixed(2)}°N, ${origin.lon.toFixed(2)}°E</div>
        </div>`

      circle.bindPopup(popupHtml, { className: 'origin-popup-light' })
      circle.bindTooltip(
        `<div style="font-size:11px;color:#0F172A;font-weight:600;">${placeLabel}</div>`,
        { direction: 'top', className: 'origin-tooltip-light' }
      )

      group.addLayer(line)
      group.addLayer(circle)
    })

    // Destination marker
    const dest = L.circleMarker(CTR, {
      radius: 5,
      color: '#FF6B35',
      fillColor: '#FF6B35',
      fillOpacity: 0.9,
      weight: 2,
    })
    dest.bindTooltip(
      '<div style="font-size:11px;color:#F1F5F9"><b style="color:#FF6B35">Simrishamn</b><br/>Destination</div>',
      { direction: 'top' }
    )
    group.addLayer(dest)

    group.addTo(map)
    svgRef.current = group

    return () => {
      if (svgRef.current) {
        map.removeLayer(svgRef.current)
        svgRef.current = null
      }
    }
  }, [map, origins, maxCount])

  return null
}
