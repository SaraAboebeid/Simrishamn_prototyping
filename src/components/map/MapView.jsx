import React, { useEffect } from 'react'
import { MapContainer, TileLayer, GeoJSON, useMap } from 'react-leaflet'
import L from 'leaflet'
import { useDashboard } from '../../context/DashboardContext'
import { attractions } from '../../data/simrishamnData'
import MapLegend       from './MapLegend'
import AttractionLayer from './AttractionLayer'
import HeatmapLayer    from './HeatmapLayer'
import OvertourismLayer from './OvertourismLayer'
import OriginLayer     from './OriginLayer'

// Fix Leaflet default icon paths for Vite
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconUrl:       new URL('leaflet/dist/images/marker-icon.png',    import.meta.url).href,
  iconRetinaUrl: new URL('leaflet/dist/images/marker-icon-2x.png', import.meta.url).href,
  shadowUrl:     new URL('leaflet/dist/images/marker-shadow.png',  import.meta.url).href,
})

function FitBounds({ coords }) {
  const map = useMap()
  useEffect(() => {
    if (coords.length) map.fitBounds(L.latLngBounds(coords), { padding: [40, 40] })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps
  return null
}

export default function MapView() {
  const { activeLayers, uploadedLayers } = useDashboard()
  const allCoords = attractions.map(a => a.coords)

  return (
    <div style={{ height: '100%', width: '100%', position: 'relative' }}>
      <MapLegend />

      <MapContainer
        center={[55.56, 14.22]}
        zoom={11}
        style={{ height: '100%', width: '100%' }}
        zoomControl={false}
      >
        {/* CartoDB Dark Matter — uses OSM data with Skåne-friendly dark style */}
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          maxZoom={19}
        />

        <FitBounds coords={allCoords} />

        {activeLayers.heatmap      && <HeatmapLayer />}
        {activeLayers.overtourism  && <OvertourismLayer />}
        {activeLayers.origins      && <OriginLayer />}
        {activeLayers.attractions  && <AttractionLayer />}

        {activeLayers.uploadedGeoJSON && uploadedLayers.map((layer, i) => (
          <GeoJSON
            key={i}
            data={layer.data}
            style={{ color: '#8B5CF6', weight: 2, fillOpacity: 0.15 }}
          />
        ))}
      </MapContainer>
    </div>
  )
}
