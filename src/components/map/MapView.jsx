import React, { useEffect, useMemo, useRef } from 'react'
import { MapContainer, TileLayer, useMap } from 'react-leaflet'
import L from 'leaflet'
import { useDashboard } from '../../context/DashboardContext'
import { aggregateOrigins } from '../../data/visitDataLoader'
import MapLegend          from './MapLegend'
import HeatmapLayer       from './HeatmapLayer'
import OriginLayer        from './OriginLayer'
import OvertourismLayer   from './OvertourismLayer'
import ClusterLayer       from './ClusterLayer'

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

function OriginAutoFit() {
  const map = useMap()
  const { activeLayers, filteredVisits } = useDashboard()
  const prevOriginsActive = useRef(false)

  const origins = useMemo(() => aggregateOrigins(filteredVisits), [filteredVisits])

  useEffect(() => {
    const justEnabled = activeLayers.origins && !prevOriginsActive.current
    const justDisabled = !activeLayers.origins && prevOriginsActive.current
    prevOriginsActive.current = activeLayers.origins

    if (justEnabled && origins.length) {
      const points = [TOWN_CENTER, ...origins.map(origin => [origin.lat, origin.lon])]
      const bounds = L.latLngBounds(points)

      map.flyToBounds(bounds, {
        padding: [40, 40],
        maxZoom: 6,
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
      </MapContainer>
    </div>
  )
}
