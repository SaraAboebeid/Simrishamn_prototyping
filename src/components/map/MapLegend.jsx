import React from 'react'
import { useDashboard } from '../../context/DashboardContext'
import { PRESSURE_COLORS } from '../../theme/colors'

export default function MapLegend() {
  const { activeLayers } = useDashboard()

  const activeLegendItems = [
    activeLayers.heatmap && { key: 'heatmap', label: 'Heatmap hotspots', color: '#EF4444' },
    activeLayers.touristStops && { key: 'touristStops', label: 'Tourist stops (10 min+)', color: '#FB923C' },
    activeLayers.clusters && { key: 'clusters', label: 'Visit clusters', color: '#38BDF8' },
    activeLayers.origins && { key: 'origins', label: 'Origin tracking', color: '#06B6D4' },
    activeLayers.uploadedGeoJSON && { key: 'imported', label: 'Imported layer', color: '#8B5CF6' },
  ].filter(Boolean)

  return (
    <div
      style={{
        position: 'absolute', top: 10, right: 10, zIndex: 1000,
        background: 'rgba(25,11,14,0.92)',
        border: '1px solid #2D3A52',
        borderRadius: 10, padding: '8px 12px',
        fontSize: 10, color: '#CBD5E1',
        backdropFilter: 'blur(10px)',
      }}
    >
      {!!activeLegendItems.length && (
        <>
          <div style={{
            fontWeight: 700, marginBottom: 5,
            color: '#38BDF8',
            letterSpacing: '0.10em', fontSize: 9, textTransform: 'uppercase',
          }}>
            Active Layers
          </div>
          {activeLegendItems.map(item => (
            <div key={item.key} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: item.color, flexShrink: 0 }} />
              <span>{item.label}</span>
            </div>
          ))}
        </>
      )}

      {activeLayers.overtourism && (
        <>
          <div style={{
            fontWeight: 700, marginTop: activeLegendItems.length ? 6 : 0, marginBottom: 5,
            color: '#F59E0B',
            letterSpacing: '0.10em', fontSize: 9, textTransform: 'uppercase',
          }}>
            Pressure Level
          </div>
          {Object.entries(PRESSURE_COLORS).map(([lvl, col]) => (
            <div key={lvl} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: col, flexShrink: 0 }} />
              <span style={{ textTransform: 'capitalize' }}>{lvl}</span>
            </div>
          ))}
        </>
      )}

      {activeLayers.heatmap && (
        <>
          <div style={{
            fontWeight: 700,
            marginTop: (activeLegendItems.length || activeLayers.overtourism) ? 6 : 0,
            marginBottom: 5,
            color: '#06B6D4',
            letterSpacing: '0.10em',
            fontSize: 9,
            textTransform: 'uppercase',
          }}>
            Heatmap Scale
          </div>
          {[
            { label: 'Low', color: '#06B6D4' },
            { label: 'Moderate', color: '#10B981' },
            { label: 'High', color: '#F59E0B' },
            { label: 'Relative peak', color: '#EF4444' },
          ].map(item => (
            <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: item.color, flexShrink: 0 }} />
              <span>{item.label}</span>
            </div>
          ))}
        </>
      )}

      {activeLayers.clusters && (
        <>
          <div style={{
            fontWeight: 700,
            marginTop: (activeLegendItems.length || activeLayers.overtourism || activeLayers.heatmap) ? 6 : 0,
            marginBottom: 5,
            color: '#38BDF8',
            letterSpacing: '0.10em',
            fontSize: 9,
            textTransform: 'uppercase',
          }}>
            Cluster Size
          </div>
          {[
            { label: 'Small cluster', size: 6 },
            { label: 'Medium cluster', size: 10 },
            { label: 'Large cluster', size: 14 },
          ].map(item => (
            <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
              <div
                style={{
                  width: item.size,
                  height: item.size,
                  borderRadius: '50%',
                  border: '1px solid #38BDF8',
                  background: 'rgba(6,182,212,0.45)',
                  flexShrink: 0,
                }}
              />
              <span>{item.label}</span>
            </div>
          ))}
        </>
      )}
    </div>
  )
}
