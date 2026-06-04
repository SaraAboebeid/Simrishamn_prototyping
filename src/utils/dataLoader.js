/**
 * dataLoader.js
 * Utilities for loading spatial data from GeoJSON (and converting from GeoPackage).
 *
 * ── Workflow ───────────────────────────────────────────────────────────
 *  1. In Python/geopandas, export your GeoDataFrame:
 *       import geopandas as gpd
 *       gdf = gpd.read_file("data.gpkg", layer="tourism_points")
 *       gdf.to_crs(epsg=4326).to_file("out.geojson", driver="GeoJSON")
 *
 *  2. Drag the resulting .geojson into the "Import Spatial Data" panel in the sidebar.
 *
 *  3. The layer will appear on the map and can be toggled.
 * ───────────────────────────────────────────────────────────────────────
 */

/**
 * Read a File object and parse it as GeoJSON.
 * @param {File} file
 * @returns {Promise<GeoJSON.FeatureCollection>}
 */
export function parseGeoJSON(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = e => {
      try {
        const data = JSON.parse(e.target.result)
        if (!data.type || !['FeatureCollection','Feature'].includes(data.type)) {
          reject(new Error('Not a valid GeoJSON object'))
          return
        }
        resolve(data)
      } catch {
        reject(new Error('JSON parse error — ensure the file is valid GeoJSON'))
      }
    }
    reader.onerror = () => reject(new Error('File could not be read'))
    reader.readAsText(file)
  })
}

/**
 * Convert a Point FeatureCollection to heatmap triples [lat, lng, intensity].
 * @param {GeoJSON.FeatureCollection} geojson
 * @param {string} intensityField  — property name holding the intensity value (0–1 or raw count)
 * @returns {Array<[number, number, number]>}
 */
export function geoJSONToHeatmap(geojson, intensityField = 'visitors') {
  if (!geojson?.features) return []

  const points = geojson.features
    .filter(f => f.geometry?.type === 'Point')
    .map(f => {
      const [lng, lat] = f.geometry.coordinates
      return { lat, lng, value: Number(f.properties?.[intensityField]) || 0 }
    })

  const max = Math.max(...points.map(p => p.value), 1)
  return points.map(p => [p.lat, p.lng, p.value / max])
}

/**
 * Extract named property values from a FeatureCollection for charting.
 * @param {GeoJSON.FeatureCollection} geojson
 * @param {string[]} fields
 * @returns {object[]}
 */
export function extractProperties(geojson, fields) {
  if (!geojson?.features) return []
  return geojson.features.map(f => {
    const out = {}
    fields.forEach(field => { out[field] = f.properties?.[field] ?? null })
    return out
  })
}
