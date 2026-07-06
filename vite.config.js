import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { execFile } from 'node:child_process'
import { promises as fs } from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const rootDir = path.dirname(fileURLToPath(import.meta.url))
const dataDir = path.join(rootDir, 'public', 'data')

function runPythonGpkgConversion(src, outDir) {
  return new Promise((resolve, reject) => {
    const pyCode = [
      'import geopandas as gpd, pyogrio, json, sys, os',
      'src = sys.argv[1]',
      'out_dir = sys.argv[2]',
      'layers = pyogrio.list_layers(src)',
      'out = []',
      'for row in layers:',
      "    layer_name = row[0] if isinstance(row, (list, tuple)) else row",
      '    gdf = gpd.read_file(src, layer=layer_name).to_crs(epsg=4326)',
      '    for col in gdf.columns:',
      "        if str(gdf[col].dtype).startswith('datetime64'):",
      '            gdf[col] = gdf[col].astype(str)',
      '    out_path = os.path.join(out_dir, f"{layer_name}.geojson")',
      '    gdf.to_file(out_path, driver="GeoJSON")',
      '    out.append({"layer": layer_name, "path": out_path})',
      'print(json.dumps(out))',
    ].join('\n')

    execFile('python', ['-c', pyCode, src, outDir], { maxBuffer: 1024 * 1024 * 20 }, (err, stdout, stderr) => {
      if (err) {
        reject(new Error(`GPKG conversion failed: ${stderr || err.message}`))
        return
      }
      try {
        resolve(JSON.parse(stdout.trim() || '[]'))
      } catch (parseErr) {
        reject(new Error(`Failed to parse conversion output: ${parseErr.message}`))
      }
    })
  })
}

function isTouristStops(geojson) {
  const f = geojson?.features?.[0]
  return Boolean(f?.properties?.visitor_count != null || f?.properties?.stop_count != null)
}

function isTouristDeso(geojson) {
  const f = geojson?.features?.[0]
  return Boolean(f?.properties?.desokod_home != null || f?.properties?.kommunnamn_home != null)
}

function classifyLayer(layerName, geojson) {
  if (isTouristStops(geojson)) return { kind: 'touristStops', name: layerName, data: geojson }
  if (isTouristDeso(geojson)) return { kind: 'touristDeso', name: layerName, data: geojson }
  return { kind: 'uploaded', name: layerName, data: geojson }
}

function buildOriginsFromTouristDeso(touristDeso, grouping = 'deso') {
  if (!touristDeso?.features?.length) return null

  const keyCandidates = grouping === 'city'
    ? ['kommunnamn_home', 'kommunnamn_other']
    : ['desokod_home', 'desokod_other', 'desokod']

  const groups = {}

  touristDeso.features.forEach((feature) => {
    const properties = feature.properties || {}
    const key = keyCandidates.map(k => properties[k]).find(Boolean) ?? properties.kommunnamn_home ?? properties.kommunnamn_other ?? properties.desokod_home ?? properties.desokod_other
    if (!key) return

    const lat = Number(properties.centroid_lat)
    const lon = Number(properties.centroid_lon)
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) return

    if (!groups[key]) {
      groups[key] = {
        origin_label: String(key),
        centroid_lat_sum: 0,
        centroid_lon_sum: 0,
        row_count: 0,
        unique_device_sum: 0,
        kommunnamn_home: properties.kommunnamn_home ?? properties.kommunnamn_other ?? null,
        desokod_home: properties.desokod_home ?? properties.desokod_other ?? properties.desokod ?? null,
      }
    }

    groups[key].centroid_lat_sum += lat
    groups[key].centroid_lon_sum += lon
    groups[key].row_count += 1

    const uniqueDevices = Number(properties.unique_devices)
    if (Number.isFinite(uniqueDevices) && uniqueDevices > 0) {
      groups[key].unique_device_sum += uniqueDevices
    }
  })

  const features = Object.values(groups).map((group) => {
    const lat = group.centroid_lat_sum / group.row_count
    const lon = group.centroid_lon_sum / group.row_count

    return {
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [lon, lat] },
      properties: {
        origin_label: group.kommunnamn_home ?? group.origin_label,
        origin_level: grouping,
        count: group.unique_device_sum > 0 ? group.unique_device_sum : group.row_count,
        kommunnamn_home: group.kommunnamn_home,
        desokod_home: group.desokod_home,
        centroid_lat: lat,
        centroid_lon: lon,
      },
    }
  })

  return { type: 'FeatureCollection', features }
}

async function spatialConversionPlugin() {
  await fs.mkdir(dataDir, { recursive: true })

  return {
    name: 'spatial-conversion-plugin',
    configureServer(server) {
      server.middlewares.use('/api/convert-spatial', async (req, res, next) => {
        if (req.method !== 'POST') return next()

        try {
          let body = ''
          req.on('data', chunk => { body += chunk })
          req.on('end', async () => {
            try {
              const payload = JSON.parse(body || '{}')
              const { fileName, mimeType, base64 } = payload
              if (!fileName || !base64) {
                res.statusCode = 400
                res.end(JSON.stringify({ error: 'Missing file data' }))
                return
              }

              const buffer = Buffer.from(base64, 'base64')
              const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'simrishamn-spatial-'))
              const inputPath = path.join(tmpDir, fileName)
              await fs.writeFile(inputPath, buffer)

              const conversion = await runPythonGpkgConversion(inputPath, tmpDir)
              const outputs = []
              let touristStops = null
              let touristDeso = null

              for (const layer of conversion) {
                const raw = await fs.readFile(layer.path, 'utf8')
                const geojson = JSON.parse(raw)
                const classified = classifyLayer(layer.layer, geojson)
                const outPath = path.join(dataDir, `${classified.name}.geojson`)
                await fs.writeFile(outPath, JSON.stringify(classified.data, null, 2))
                outputs.push({ ...classified, path: outPath })
                if (classified.kind === 'touristStops') touristStops = classified.data
                if (classified.kind === 'touristDeso') touristDeso = classified.data
              }

              const originGrouping = (process.env.ORIGIN_GROUPING || 'deso').toLowerCase() === 'city' ? 'city' : 'deso'
              const touristOrigins = buildOriginsFromTouristDeso(touristDeso, originGrouping)
              if (touristOrigins) {
                const originsPath = path.join(dataDir, 'tourist_origins.geojson')
                await fs.writeFile(originsPath, JSON.stringify(touristOrigins, null, 2))
                outputs.push({ kind: 'touristOrigins', name: 'tourist_origins', path: originsPath, data: touristOrigins })
              }

              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({
                ok: true,
                outputs: outputs.map(({ kind, name, path: outPath, data }) => ({
                  kind,
                  name,
                  path: outPath,
                  featureCount: data?.features?.length ?? 0,
                })),
                touristStops: touristStops?.features?.length ?? 0,
                touristDeso: touristDeso?.features?.length ?? 0,
                touristOrigins: touristOrigins?.features?.length ?? 0,
              }))
            } catch (err) {
              res.statusCode = 500
              res.end(JSON.stringify({ error: err.message }))
            }
          })
        } catch (err) {
          res.statusCode = 500
          res.end(JSON.stringify({ error: err.message }))
        }
      })
    },
  }
}

export default defineConfig({
  plugins: [react(), spatialConversionPlugin()],
})
