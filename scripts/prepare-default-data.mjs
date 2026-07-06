import { execFile } from 'node:child_process'
import { promises as fs } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const root = path.resolve(__dirname, '..')

const sourceGpkg = path.join(root, 'data', 'overtourism_test.gpkg')
const outDir = path.join(root, 'public', 'data')
const outStops = path.join(outDir, 'tourists_stops_10min.geojson')
const outDeso = path.join(outDir, 'tourists_home_deso.geojson')
const outOrigins = path.join(outDir, 'tourist_origins.geojson')
const originGrouping = (process.env.ORIGIN_GROUPING || 'deso').toLowerCase() === 'city' ? 'city' : 'deso'

function execFileAsync(cmd, args, opts = {}) {
  return new Promise((resolve, reject) => {
    execFile(cmd, args, opts, (error, stdout, stderr) => {
      if (error) {
        reject(new Error(stderr || error.message))
        return
      }
      resolve({ stdout, stderr })
    })
  })
}

async function exists(p) {
  try {
    await fs.access(p)
    return true
  } catch {
    return false
  }
}

async function needsRebuild() {
  if (!(await exists(sourceGpkg))) return false
  if (!(await exists(outStops)) || !(await exists(outDeso)) || !(await exists(outOrigins))) return true

  const [srcStat, stopsStat, desoStat, originsStat] = await Promise.all([
    fs.stat(sourceGpkg),
    fs.stat(outStops),
    fs.stat(outDeso),
    fs.stat(outOrigins),
  ])

  const sourceIsNewer = srcStat.mtimeMs > Math.min(stopsStat.mtimeMs, desoStat.mtimeMs, originsStat.mtimeMs)
  if (sourceIsNewer) return true

  try {
    const raw = await fs.readFile(outOrigins, 'utf8')
    const parsed = JSON.parse(raw)
    const current = parsed?.features?.[0]?.properties?.origin_level
    if (current !== originGrouping) return true
  } catch {
    return true
  }

  return false
}

async function main() {
  if (!(await exists(sourceGpkg))) {
    console.log('[prepare-data] Skipping: data/overtourism_test.gpkg not found')
    return
  }

  const rebuild = await needsRebuild()
  if (!rebuild) {
    console.log('[prepare-data] Up to date')
    return
  }

  await fs.mkdir(outDir, { recursive: true })

  const pyCode = [
    'import geopandas as gpd, sys',
    'src = sys.argv[1]',
    'out_stops = sys.argv[2]',
    'out_deso = sys.argv[3]',
    'out_origins = sys.argv[4]',
    'origin_grouping = sys.argv[5]',
    "stops = gpd.read_file(src, layer='tourists_stops_10min').to_crs(epsg=4326)",
    "deso = gpd.read_file(src, layer='tourists_home_deso').to_crs(epsg=4326)",
    'for col in stops.columns:',
    "    if str(stops[col].dtype).startswith('datetime64'):",
    '        stops[col] = stops[col].astype(str)',
    'for col in deso.columns:',
    "    if str(deso[col].dtype).startswith('datetime64'):",
    '        deso[col] = deso[col].astype(str)',
    'deso_proj = deso.to_crs(epsg=3006)',
    'cent = deso_proj.geometry.centroid',
    "cent_gdf = gpd.GeoDataFrame(geometry=cent, crs='EPSG:3006').to_crs(epsg=4326)",
    "deso['centroid_lat'] = cent_gdf.geometry.y",
    "deso['centroid_lon'] = cent_gdf.geometry.x",
    "deso_col = 'desokod_home' if 'desokod_home' in deso.columns else ('desokod_other' if 'desokod_other' in deso.columns else ('desokod' if 'desokod' in deso.columns else None))",
    "city_col = 'kommunnamn_home' if 'kommunnamn_home' in deso.columns else ('kommunnamn_other' if 'kommunnamn_other' in deso.columns else None)",
    "group_col = deso_col if origin_grouping == 'deso' else city_col",
    'if group_col is None:',
    "    raise RuntimeError('No DeSO/city grouping column found in tourists_home_deso layer')",
    "agg = {'centroid_lat': 'mean', 'centroid_lon': 'mean'}",
    "if city_col and group_col != city_col: agg[city_col] = 'first'",
    "if deso_col and group_col != deso_col: agg[deso_col] = 'first'",
    'origins = deso.groupby(group_col, dropna=False).agg(agg).reset_index()',
    "counts = deso.groupby(group_col, dropna=False).size().reset_index(name='count')",
    "origins = origins.merge(counts, on=group_col, how='left')",
    "origins = origins.rename(columns={group_col: 'origin_label'})",
    "if city_col and city_col in origins.columns: origins = origins.rename(columns={city_col: 'kommunnamn_home'})",
    "if deso_col and deso_col in origins.columns: origins = origins.rename(columns={deso_col: 'desokod_home'})",
    "if 'kommunnamn_home' in origins.columns: origins['origin_label'] = origins['kommunnamn_home'].fillna(origins['origin_label'])",
    "origins_gdf = gpd.GeoDataFrame(origins, geometry=gpd.points_from_xy(origins['centroid_lon'], origins['centroid_lat']), crs='EPSG:4326')",
    "origins_gdf['origin_level'] = origin_grouping",
    "stops.to_file(out_stops, driver='GeoJSON')",
    "deso.to_file(out_deso, driver='GeoJSON')",
    "origins_gdf.to_file(out_origins, driver='GeoJSON')",
    "print('ok')",
  ].join('\n')

  try {
    await execFileAsync('python', ['-c', pyCode, sourceGpkg, outStops, outDeso, outOrigins, originGrouping], {
      maxBuffer: 1024 * 1024 * 10,
    })
    console.log(`[prepare-data] Converted data/overtourism_test.gpkg -> public/data/*.geojson (origins grouped by: ${originGrouping})`)
  } catch (err) {
    const hasFallback = (await exists(outStops)) && (await exists(outDeso)) && (await exists(outOrigins))
    if (hasFallback) {
      console.warn('[prepare-data] Conversion failed, using existing public/data outputs')
      console.warn(`[prepare-data] ${err.message}`)
      return
    }
    throw err
  }
}

main().catch((err) => {
  console.error('[prepare-data] Failed:', err.message)
  process.exit(1)
})
