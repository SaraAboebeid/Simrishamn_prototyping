import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { execFile } from 'node:child_process'
import { promises as fs } from 'node:fs'
import { extname, join } from 'node:path'
import { tmpdir } from 'node:os'
import { randomUUID } from 'node:crypto'

function sendJson(res, status, payload) {
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json')
  res.end(JSON.stringify(payload))
}

async function readJsonBody(req) {
  const chunks = []
  for await (const chunk of req) chunks.push(chunk)
  const raw = Buffer.concat(chunks).toString('utf8')
  return raw ? JSON.parse(raw) : {}
}

function normalizeGeoJSON(obj) {
  if (!obj) return null
  if (obj.type === 'FeatureCollection') return obj
  if (obj.type === 'Feature') return { type: 'FeatureCollection', features: [obj] }
  return null
}

function isTouristStops(geojson) {
  const f = geojson?.features?.[0]
  return Boolean(
    f?.geometry?.type === 'Point' &&
    (f?.properties?.device_uid != null) &&
    (f?.properties?.start_time != null)
  )
}

function isTouristDeso(geojson) {
  const f = geojson?.features?.[0]
  return Boolean(
    f?.properties?.desokod_home != null ||
    f?.properties?.kommunnamn_home != null
  )
}

function classifyLayer(layerName, geojson) {
  if (isTouristStops(geojson)) return { kind: 'touristStops', name: layerName, data: geojson }
  if (isTouristDeso(geojson)) return { kind: 'touristDeso', name: layerName, data: geojson }
  return { kind: 'uploaded', name: layerName, data: geojson }
}

async function runPythonGpkgConversion(inputPath) {
  const pyCode = [
    'import geopandas as gpd, pyogrio, json, sys',
    'src = sys.argv[1]',
    'layers = pyogrio.list_layers(src)',
    'out = []',
    'for layer_name, _geom in layers:',
    '    gdf = gpd.read_file(src, layer=layer_name).to_crs(epsg=4326)',
    '    for col in gdf.columns:',
    "        if str(gdf[col].dtype).startswith('datetime64'):",
    '            gdf[col] = gdf[col].astype(str)',
    "    if ('kommunnamn_home' in gdf.columns) and gdf.geom_type.isin(['Polygon','MultiPolygon']).any():",
    '        gdf_proj = gdf.to_crs(epsg=3006)',
    '        cent = gdf_proj.geometry.centroid.to_crs(epsg=4326)',
    "        gdf['centroid_lat'] = cent.y",
    "        gdf['centroid_lon'] = cent.x",
    "    out.append({'name': str(layer_name), 'data': json.loads(gdf.to_json())})",
    "print(json.dumps({'layers': out}))",
  ].join('\n')

  return new Promise((resolve, reject) => {
    execFile('python', ['-c', pyCode, inputPath], { maxBuffer: 1024 * 1024 * 50 }, (err, stdout, stderr) => {
      if (err) {
        reject(new Error(stderr || err.message))
        return
      }
      try {
        resolve(JSON.parse(stdout))
      } catch {
        reject(new Error('Python conversion returned invalid JSON output'))
      }
    })
  })
}

function spatialConversionPlugin() {
  return {
    name: 'spatial-conversion-api',
    configureServer(server) {
      server.middlewares.use('/api/convert-spatial', async (req, res, next) => {
        if (req.method !== 'POST') {
          next()
          return
        }

        try {
          const body = await readJsonBody(req)
          const fileName = body?.fileName || 'uploaded.bin'
          const ext = extname(fileName).toLowerCase()
          const base64 = body?.fileContentBase64
          if (!base64) {
            sendJson(res, 400, { ok: false, error: 'Missing file content' })
            return
          }

          const bytes = Buffer.from(base64, 'base64')
          const tmpPath = join(tmpdir(), `spatial-${randomUUID()}${ext || ''}`)
          await fs.writeFile(tmpPath, bytes)

          let classified = []

          if (ext === '.gpkg') {
            const converted = await runPythonGpkgConversion(tmpPath)
            const layers = converted?.layers || []
            classified = layers
              .map(layer => ({ ...layer, data: normalizeGeoJSON(layer.data) }))
              .filter(layer => layer.data)
              .map(layer => classifyLayer(layer.name, layer.data))
          } else if (ext === '.geojson' || ext === '.json') {
            const parsed = JSON.parse(bytes.toString('utf8'))
            const geojson = normalizeGeoJSON(parsed)
            if (!geojson) {
              sendJson(res, 400, { ok: false, error: 'File is not valid GeoJSON/FeatureCollection' })
              return
            }
            classified = [classifyLayer(fileName, geojson)]
          } else {
            sendJson(res, 400, { ok: false, error: 'Unsupported file type. Use .geojson, .json, or .gpkg' })
            return
          }

          await fs.unlink(tmpPath).catch(() => {})

          const touristStops = classified.find(x => x.kind === 'touristStops')?.data || null
          const touristDeso = classified.find(x => x.kind === 'touristDeso')?.data || null
          const uploadedLayers = classified
            .filter(x => x.kind === 'uploaded')
            .map(x => ({ name: x.name, data: x.data }))

          sendJson(res, 200, {
            ok: true,
            parsed: true,
            converted: true,
            datasets: {
              touristStops,
              touristDeso,
              uploadedLayers,
            },
            summary: {
              touristStopsFeatures: touristStops?.features?.length || 0,
              touristDesoFeatures: touristDeso?.features?.length || 0,
              uploadedLayerCount: uploadedLayers.length,
            },
          })
        } catch (err) {
          sendJson(res, 500, { ok: false, error: err?.message || 'Conversion failed' })
        }
      })
    },
  }
}

export default defineConfig({
  plugins: [react(), spatialConversionPlugin()],
})
