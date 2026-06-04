// ──────────────────────────────────────────────────────────────────
//  Simrishamn Tourism Dashboard · Mock Data
//  Replace or augment with real GeoPackage / GeoDataFrame exports.
// ──────────────────────────────────────────────────────────────────
import { TYPE_COLORS } from '../theme/colors'

export const YEARS = [2018, 2019, 2020, 2021, 2022, 2023, 2024]

export const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

// Colours sourced from theme/colors.js (Skåne palette)
export const TOURISM_TYPES = [
  { id: 'cultural', label: 'Cultural & Heritage', color: TYPE_COLORS.cultural, icon: '🏙️' },
  { id: 'nature',   label: 'Nature & Parks',      color: TYPE_COLORS.nature,   icon: '🌿' },
  { id: 'beach',    label: 'Beaches & Coast',     color: TYPE_COLORS.beach,    icon: '🏖️' },
  { id: 'food',     label: 'Food & Drink',        color: TYPE_COLORS.food,     icon: '🍎' },
  { id: 'events',   label: 'Events & Markets',    color: TYPE_COLORS.events,   icon: '🎤' },
]

export const SEASONS = [
  { id: 'all',    label: 'All Year', months: [0,1,2,3,4,5,6,7,8,9,10,11] },
  { id: 'spring', label: 'Spring',   months: [2,3,4] },
  { id: 'summer', label: 'Summer',   months: [5,6,7] },
  { id: 'autumn', label: 'Autumn',   months: [8,9,10] },
  { id: 'winter', label: 'Winter',   months: [11,0,1] },
]

// PRESSURE_COLORS moved to src/theme/colors.js — import from there.

// Monthly distribution proportions per year (must sum ≈ 1.0)
const MONTHLY_PROPS = {
  2018: [0.020,0.022,0.045,0.068,0.092,0.132,0.248,0.215,0.082,0.045,0.018,0.013],
  2019: [0.021,0.023,0.044,0.066,0.090,0.130,0.252,0.220,0.083,0.044,0.017,0.010],
  2020: [0.022,0.028,0.038,0.055,0.098,0.148,0.265,0.225,0.072,0.028,0.012,0.009],
  2021: [0.023,0.024,0.042,0.062,0.088,0.135,0.258,0.222,0.080,0.040,0.016,0.010],
  2022: [0.022,0.024,0.046,0.070,0.093,0.135,0.245,0.210,0.085,0.048,0.013,0.009],
  2023: [0.020,0.024,0.047,0.064,0.090,0.131,0.247,0.217,0.087,0.048,0.016,0.009],
  2024: [0.021,0.025,0.048,0.066,0.091,0.132,0.243,0.215,0.088,0.049,0.014,0.008],
}

// ── Yearly aggregates ─────────────────────────────────────────────
export const yearlyStats = {
  2018: { total:580000, domestic:440000, international:140000, revenue:245000000, avgStay:2.8, overtourismIndex:42 },
  2019: { total:625000, domestic:465000, international:160000, revenue:268000000, avgStay:2.9, overtourismIndex:46 },
  2020: { total:320000, domestic:295000, international: 25000, revenue:142000000, avgStay:3.2, overtourismIndex:24 },
  2021: { total:485000, domestic:450000, international: 35000, revenue:198000000, avgStay:3.1, overtourismIndex:35 },
  2022: { total:695000, domestic:490000, international:205000, revenue:318000000, avgStay:2.7, overtourismIndex:52 },
  2023: { total:748000, domestic:510000, international:238000, revenue:356000000, avgStay:2.6, overtourismIndex:58 },
  2024: { total:782000, domestic:525000, international:257000, revenue:385000000, avgStay:2.5, overtourismIndex:63 },
}

// ── Attraction points ─────────────────────────────────────────────
export const attractions = [
  {
    id: 'ales-stenar',
    name: 'Ales Stenar',
    type: 'cultural',
    coords: [55.3845, 14.0525],
    description: "Scandinavia's largest stone ship monument — 59 megaliths arranged on a cliff above the Baltic Sea.",
    rating: 4.8, capacityPerDay: 1500, pressureLevel: 'high', area: 'Kåseberga',
    visitors: { 2018:120000, 2019:135000, 2020:65000, 2021:105000, 2022:155000, 2023:168000, 2024:175000 },
  },
  {
    id: 'stenshuvud',
    name: 'Stenshuvud National Park',
    type: 'nature',
    coords: [55.6700, 14.2667],
    description: 'Coastal national park with sandy beaches, orchid meadows, ancient forest and sea panoramas.',
    rating: 4.7, capacityPerDay: 3000, pressureLevel: 'medium', area: 'Kivik',
    visitors: { 2018:180000, 2019:195000, 2020:110000, 2021:165000, 2022:215000, 2023:230000, 2024:248000 },
  },
  {
    id: 'simrishamn-town',
    name: 'Simrishamn Old Town',
    type: 'cultural',
    coords: [55.5567, 14.3523],
    description: 'Medieval town centre with St. Nikolai church, cobblestone streets and the iconic harbour.',
    rating: 4.3, capacityPerDay: 5000, pressureLevel: 'medium', area: 'Simrishamn',
    visitors: { 2018:95000, 2019:102000, 2020:58000, 2021:85000, 2022:115000, 2023:125000, 2024:132000 },
  },
  {
    id: 'brantevik',
    name: 'Brantevik',
    type: 'cultural',
    coords: [55.5167, 14.3333],
    description: 'Picturesque fishing village — the departure point of the 1869 emigrant ship. Red cottages, calm harbour.',
    rating: 4.5, capacityPerDay: 800, pressureLevel: 'high', area: 'Brantevik',
    visitors: { 2018:45000, 2019:48000, 2020:28000, 2021:40000, 2022:58000, 2023:65000, 2024:68000 },
  },
  {
    id: 'kiviks-musteri',
    name: 'Kiviks Musteri',
    type: 'food',
    coords: [55.6900, 14.2167],
    description: "Österlen's celebrated apple orchard & cidery with farm museum, orchard walks and tastings.",
    rating: 4.4, capacityPerDay: 1200, pressureLevel: 'medium', area: 'Kivik',
    visitors: { 2018:75000, 2019:82000, 2020:38000, 2021:62000, 2022:88000, 2023:95000, 2024:98000 },
  },
  {
    id: 'kungagraven',
    name: 'Kungagraven i Kivik',
    type: 'cultural',
    coords: [55.6833, 14.2000],
    description: "Sweden's most significant Bronze Age burial cairn (~1000 BC) with carved stone slabs inside.",
    rating: 4.6, capacityPerDay: 600, pressureLevel: 'critical', area: 'Kivik',
    visitors: { 2018:28000, 2019:32000, 2020:18000, 2021:28000, 2022:35000, 2023:38000, 2024:40000 },
  },
  {
    id: 'havang',
    name: 'Haväng Nature Reserve',
    type: 'nature',
    coords: [55.6167, 14.1667],
    description: 'Remote coastal reserve with dramatic moraine cliffs, pristine beaches and rare coastal flora.',
    rating: 4.5, capacityPerDay: 2000, pressureLevel: 'low', area: 'Haväng',
    visitors: { 2018:22000, 2019:18000, 2020:15000, 2021:22000, 2022:28000, 2023:24000, 2024:21000 },
  },
  {
    id: 'vitemolla',
    name: 'Vitemölla Beach',
    type: 'beach',
    coords: [55.6000, 14.2500],
    description: 'Popular sandy beach with shallow, family-friendly water and scenic dune landscape.',
    rating: 4.2, capacityPerDay: 4000, pressureLevel: 'medium', area: 'Vitemölla',
    visitors: { 2018:65000, 2019:72000, 2020:85000, 2021:95000, 2022:105000, 2023:118000, 2024:125000 },
  },
  {
    id: 'kiviks-marknad',
    name: 'Kiviks Marknad',
    type: 'events',
    coords: [55.6950, 14.2100],
    description: "One of Sweden's largest annual fairs (late July). 300 000+ visitors over 3 days. Extreme peak pressure.",
    rating: 4.0, capacityPerDay: 100000, pressureLevel: 'critical', area: 'Kivik',
    visitors: { 2018:85000, 2019:92000, 2020:0, 2021:45000, 2022:125000, 2023:145000, 2024:158000 },
  },
]

// ── Overtourism zone polygons ─────────────────────────────────────
export const overtourismZones = [
  {
    id: 'kaseberg-zone',
    name: 'Kåseberga Access Zone',
    level: 'critical',
    coords: [[55.390,14.040],[55.390,14.065],[55.378,14.065],[55.378,14.040]],
    issue: 'Parking overflow, path erosion, sunset crowding',
  },
  {
    id: 'brantevik-zone',
    name: 'Brantevik Harbour Zone',
    level: 'high',
    coords: [[55.521,14.325],[55.521,14.343],[55.512,14.343],[55.512,14.325]],
    issue: 'Village capacity exceeded on summer weekends',
  },
  {
    id: 'kivik-marknad-zone',
    name: 'Kiviks Marknad Zone',
    level: 'critical',
    coords: [[55.700,14.205],[55.700,14.220],[55.688,14.220],[55.688,14.205]],
    issue: 'Annual July fair: extreme 3-day footfall spike',
  },
  {
    id: 'stenshuvud-trail',
    name: 'Stenshuvud Trail Pressure',
    level: 'medium',
    coords: [[55.678,14.258],[55.678,14.278],[55.662,14.278],[55.662,14.258]],
    issue: 'Main hiking trail showing erosion signs in summer',
  },
]

// ── Derived helpers ───────────────────────────────────────────────

export function getMonthlyData(year) {
  const stats = yearlyStats[year] || yearlyStats[2023]
  const props = MONTHLY_PROPS[year] || MONTHLY_PROPS[2023]
  return MONTHS.map((month, i) => ({
    month,
    visitors:      Math.round(stats.total       * props[i]),
    domestic:      Math.round(stats.domestic    * props[i]),
    international: Math.round(stats.international * props[i]),
  }))
}

export function getFilteredMonthlyData(year, season) {
  const monthly = getMonthlyData(year)
  const s = SEASONS.find(s => s.id === season)
  if (!s || season === 'all') return monthly
  return monthly.filter((_, i) => s.months.includes(i))
}

export function getHeatmapData(year) {
  const values = attractions.map(a => a.visitors[year] || 0)
  const maxV = Math.max(...values, 1)
  return attractions.flatMap((a, idx) => {
    const intensity = values[idx] / maxV
    const pts = [[a.coords[0], a.coords[1], intensity]]
    const clusterCount = Math.floor(intensity * 14)
    for (let i = 0; i < clusterCount; i++) {
      const angle = Math.random() * Math.PI * 2
      const dist  = 0.004 + Math.random() * 0.018
      pts.push([
        a.coords[0] + Math.sin(angle) * dist,
        a.coords[1] + Math.cos(angle) * dist,
        intensity * (0.25 + Math.random() * 0.55),
      ])
    }
    return pts
  })
}

export function getTourismTypeStats(year, selectedTypes) {
  return TOURISM_TYPES.filter(t => selectedTypes.includes(t.id)).map(type => {
    const subset = attractions.filter(a => a.type === type.id)
    const visitors = subset.reduce((s, a) => s + (a.visitors[year] || 0), 0)
    const peak = subset.reduce((s, a) => s + Math.max(...Object.values(a.visitors)), 0)
    return {
      subject: type.label.split(' ')[0],
      fullLabel: type.label,
      visitors,
      peakPct: peak > 0 ? Math.round((visitors / peak) * 100) : 0,
      color: type.color,
    }
  })
}

export function getFilteredAttractions(selectedTypes) {
  return attractions.filter(a => selectedTypes.includes(a.type))
}

export function formatVisitors(n) {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`
  if (n >= 1000)    return `${(n / 1000).toFixed(0)}K`
  return String(n)
}
