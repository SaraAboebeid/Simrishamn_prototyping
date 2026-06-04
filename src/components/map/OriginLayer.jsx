/**
 * OriginLayer — draws "spider / desire lines" from visitor home locations
 * to the Simrishamn area centre, with thickness proportional to count.
 * Uses raw SVG overlay via Leaflet's createPane / SVGOverlay approach.
 */
import React, { useMemo, useEffect, useRef } from 'react'
import { useMap } from 'react-leaflet'
import L from 'leaflet'
import { useDashboard } from '../../context/DashboardContext'
import { aggregateOrigins } from '../../data/visitDataLoader'

const CTR = [55.5567, 14.3542]   // Simrishamn centre [lat, lon]

export default function OriginLayer() {
  const { filteredVisits } = useDashboard()
  const map    = useMap()
  const svgRef = useRef(null)

  const origins = useMemo(() => aggregateOrigins(filteredVisits), [filteredVisits])
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
      circle.bindTooltip(
        `<div style="font-size:11px;color:#F1F5F9">Origin cluster<br/><b style="color:#06B6D4">${origin.count} visits</b><br/>${origin.lat.toFixed(2)}°N, ${origin.lon.toFixed(2)}°E</div>`,
        { className: 'leaflet-dark-tooltip', direction: 'top' }
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
