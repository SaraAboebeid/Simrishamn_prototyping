/**
 * Loads and filters the pre-processed Simrishamn visit data.
 * Returns filtered visits + aggregated KPIs for chart/map consumption.
 */
import { SEASONS_2024, HOLIDAYS_2024, LONG_WEEKENDS_2024, isHoliday, isWeekend } from './swedishCalendar'

let _cache = null

export async function loadVisitData() {
  if (_cache) return _cache
  const res = await fetch('/data/simrishamn_visits.json')
  _cache = await res.json()
  return _cache
}

/**
 * filters:
 *   dateFrom    YYYY-MM-DD | null
 *   dateTo      YYYY-MM-DD | null
 *   months      number[] (1-12) | null → all
 *   seasonKey   'winter'|'spring'|'summer'|'autumn' | null
 *   periodKey   holiday key | long-weekend key | null
 *   hourFrom    0-23
 *   hourTo      0-23
 */
export function filterVisits(visits, filters = {}) {
  const {
    dateFrom = null,
    dateTo   = null,
    months   = null,
    seasonKey = null,
    periodKey = null,
    hourFrom  = 0,
    hourTo    = 23,
  } = filters

  // Resolve period → date set
  let periodDates = null
  if (periodKey) {
    const holiday = HOLIDAYS_2024.find(h => h.key === periodKey)
    const lw      = LONG_WEEKENDS_2024.find(h => h.key === periodKey)
    const src     = holiday || lw
    if (src) periodDates = new Set(src.dates)
  }

  // Resolve season → months
  let seasonMonths = null
  if (seasonKey) {
    const s = SEASONS_2024.find(s => s.key === seasonKey)
    if (s) seasonMonths = new Set(s.months)
  }

  return visits.filter(v => {
    if (dateFrom && v.date < dateFrom) return false
    if (dateTo   && v.date > dateTo)   return false
    if (months && months.length && !months.includes(v.month)) return false
    if (seasonMonths && !seasonMonths.has(v.month)) return false
    if (periodDates  && !periodDates.has(v.date))   return false
    if (v.startHour < hourFrom || v.startHour > hourTo) return false
    return true
  })
}

export function countUniqueVisitors(visits = []) {
  return new Set(visits.map(v => v.uid)).size
}

function buildVisitorStats(visits) {
  const byVisitor = {}
  visits.forEach(v => {
    if (!byVisitor[v.uid]) {
      byVisitor[v.uid] = { uid: v.uid, dwellSum: 0, dwellCount: 0 }
    }
    byVisitor[v.uid].dwellSum += v.dwellMin
    byVisitor[v.uid].dwellCount += 1
  })
  return Object.values(byVisitor).map(v => ({
    uid: v.uid,
    avgDwellMin: v.dwellCount ? v.dwellSum / v.dwellCount : 0,
  }))
}

export function computeKPIs(visits) {
  if (!visits.length) return { total: 0, unique: 0, avgDwellDays: 0, peakMonth: null, peakHour: null, peakCell: null }

  const unique = countUniqueVisitors(visits)
  const visitorStats = buildVisitorStats(visits)
  const avgDwellMin = Math.round(visitorStats.reduce((s, v) => s + v.avgDwellMin, 0) / Math.max(visitorStats.length, 1))
  const avgDwellDays = avgDwellMin / 1440

  // Peak month
  const mc = {}
  visits.forEach(v => {
    if (!mc[v.month]) mc[v.month] = new Set()
    mc[v.month].add(v.uid)
  })
  const peakMonth = +Object.entries(mc).sort((a, b) => b[1].size - a[1].size)[0][0]

  // Peak hour
  const hc = {}
  visits.forEach(v => {
    if (!hc[v.startHour]) hc[v.startHour] = new Set()
    hc[v.startHour].add(v.uid)
  })
  const peakHour = +Object.entries(hc).sort((a, b) => b[1].size - a[1].size)[0][0]

  // Most dense 0.01° cell
  const cells = {}
  visits.forEach(v => {
    const key = `${v.lon.toFixed(2)},${v.lat.toFixed(2)}`
    if (!cells[key]) cells[key] = new Set()
    cells[key].add(v.uid)
  })
  const topCell = Object.entries(cells).sort((a, b) => b[1].size - a[1].size)[0]

  return { total: unique, unique, avgDwellDays, peakMonth, peakHour, topCell: topCell ? topCell[0] : null, topCellCount: topCell ? topCell[1].size : 0 }
}

export function aggregateMonthly(visits) {
  const agg = Array.from({ length: 12 }, (_, i) => ({ month: i + 1, visitors: 0, visits: 0, uniqueVisitors: 0, avgDwell: 0 }))
  const devices = Array.from({ length: 12 }, () => new Set())
  const dwells  = Array.from({ length: 12 }, () => [])

  visits.forEach(v => {
    const i = v.month - 1
    devices[i].add(v.uid)
    dwells[i].push(v.dwellMin)
  })

  agg.forEach((a, i) => {
    a.visitors = devices[i].size
    a.visits = a.visitors
    a.uniqueVisitors = a.visitors
    a.avgDwell = dwells[i].length ? Math.round(dwells[i].reduce((s, d) => s + d, 0) / dwells[i].length) : 0
  })

  return agg
}

export function aggregateHourly(visits) {
  const hourSets = Array.from({ length: 24 }, () => new Set())
  visits.forEach(v => { hourSets[v.startHour].add(v.uid) })
  const agg = Array.from({ length: 24 }, (_, i) => ({ hour: i, visitors: hourSets[i].size, visits: hourSets[i].size }))
  return agg
}

export function aggregateDow(visits) {
  const names = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  const daySets = names.map(() => new Set())
  visits.forEach(v => { daySets[v.dow].add(v.uid) })
  const agg = names.map((name, dow) => ({ name, dow, visitors: daySets[dow].size, visits: daySets[dow].size }))
  return agg
}

export function aggregateDwellBuckets(visits) {
  const buckets = [
    { label: '< 1h',    min: 0,   max: 60,   visitors: 0, visits: 0 },
    { label: '1–3h',    min: 60,  max: 180,  visitors: 0, visits: 0 },
    { label: '3–6h',    min: 180, max: 360,  visitors: 0, visits: 0 },
    { label: '6–12h',   min: 360, max: 720,  visitors: 0, visits: 0 },
    { label: '12h+',    min: 720, max: 9999, visitors: 0, visits: 0 },
  ]

  const visitorStats = buildVisitorStats(visits)
  visitorStats.forEach(v => {
    const b = buckets.find(b => v.avgDwellMin >= b.min && v.avgDwellMin < b.max)
    if (b) {
      b.visitors++
      b.visits = b.visitors
    }
  })
  return buckets
}

function clamp100(n) {
  if (!Number.isFinite(n)) return 0
  return Math.max(0, Math.min(100, Math.round(n)))
}

function percentile(values, p) {
  if (!values.length) return 0
  const sorted = [...values].sort((a, b) => a - b)
  const idx = Math.min(sorted.length - 1, Math.max(0, Math.ceil((p / 100) * sorted.length) - 1))
  return sorted[idx]
}

function median(values) {
  if (!values.length) return 0
  const sorted = [...values].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  if (sorted.length % 2) return sorted[mid]
  return (sorted[mid - 1] + sorted[mid]) / 2
}

function concentrationScore(visits) {
  if (!visits.length) return 0
  const grid = {}
  visits.forEach(v => {
    const lon = (Math.round(v.lon / 0.0015) * 0.0015).toFixed(4)
    const lat = (Math.round(v.lat / 0.0015) * 0.0015).toFixed(4)
    const key = `${lon},${lat}`
    if (!grid[key]) grid[key] = new Set()
    grid[key].add(v.uid)
  })
  const counts = Object.values(grid).map(s => s.size).sort((a, b) => b - a)
  const total = counts.reduce((s, c) => s + c, 0)
  const topN = Math.max(1, Math.ceil(counts.length * 0.1))
  const topShare = counts.slice(0, topN).reduce((s, c) => s + c, 0) / total
  return topShare
}

/**
 * Real-data overtourism signals from filtered data vs full-year baseline.
 */
export function computePressureMetrics(filteredVisits, allVisits) {
  if (!filteredVisits?.length || !allVisits?.length) {
    return {
      oti: 0,
      dailyLoad: 0,
      peakHourStress: 0,
      hotspotConcentration: 0,
    }
  }

  // 1) Daily load vs median daily demand in baseline year
  const baselineDailyMap = {}
  allVisits.forEach(v => {
    if (!baselineDailyMap[v.date]) baselineDailyMap[v.date] = new Set()
    baselineDailyMap[v.date].add(v.uid)
  })
  const baselineMedianDaily = Math.max(1, median(Object.values(baselineDailyMap).map(s => s.size)))

  const filteredDailyMap = {}
  filteredVisits.forEach(v => {
    if (!filteredDailyMap[v.date]) filteredDailyMap[v.date] = new Set()
    filteredDailyMap[v.date].add(v.uid)
  })
  const filteredActiveDays = Object.keys(filteredDailyMap).length || 1
  const filteredDailyTotal = Object.values(filteredDailyMap).reduce((s, set) => s + set.size, 0)
  const filteredAvgDaily = filteredDailyTotal / filteredActiveDays
  const dailyLoad = clamp100((filteredAvgDaily / baselineMedianDaily) * 50)

  // 2) Peak-hour stress vs 95th percentile of daily peak-hour share
  const dayHourMap = {}
  const dayVisitorMap = {}
  allVisits.forEach(v => {
    if (!dayHourMap[v.date]) dayHourMap[v.date] = Array.from({ length: 24 }, () => new Set())
    if (!dayVisitorMap[v.date]) dayVisitorMap[v.date] = new Set()
    dayHourMap[v.date][v.startHour].add(v.uid)
    dayVisitorMap[v.date].add(v.uid)
  })
  const baselinePeakShares = Object.keys(dayHourMap).map(date => {
    const hours = dayHourMap[date]
    const total = dayVisitorMap[date]?.size || 1
    const peak = Math.max(...hours.map(s => s.size))
    return peak / total
  })
  const baselineP95PeakShare = Math.max(0.01, percentile(baselinePeakShares, 95))

  const filteredHours = Array.from({ length: 24 }, () => new Set())
  filteredVisits.forEach(v => { filteredHours[v.startHour].add(v.uid) })
  const filteredTotalUnique = countUniqueVisitors(filteredVisits)
  const filteredPeakShare = Math.max(...filteredHours.map(s => s.size)) / Math.max(1, filteredTotalUnique)
  const peakHourStress = clamp100((filteredPeakShare / baselineP95PeakShare) * 100)

  // 3) Hotspot concentration vs baseline concentration
  const baselineHotspotShare = Math.max(0.01, concentrationScore(allVisits))
  const filteredHotspotShare = concentrationScore(filteredVisits)
  const hotspotConcentration = clamp100((filteredHotspotShare / baselineHotspotShare) * 100)

  const oti = clamp100(dailyLoad * 0.4 + peakHourStress * 0.3 + hotspotConcentration * 0.3)

  return {
    oti,
    dailyLoad,
    peakHourStress,
    hotspotConcentration,
  }
}

/** For origin spider lines: cluster home coords into 0.1° grid cells */
export function aggregateOrigins(visits) {
  const cells = {}
  visits.forEach(v => {
    if (!v.homeLon || !v.homeLat) return
    const key = `${(Math.round(v.homeLon * 10) / 10).toFixed(1)},${(Math.round(v.homeLat * 10) / 10).toFixed(1)}`
    if (!cells[key]) cells[key] = { lon: 0, lat: 0, count: 0 }
    cells[key].lon   += v.homeLon
    cells[key].lat   += v.homeLat
    cells[key].count++
  })
  return Object.values(cells).map(c => ({
    lon:   c.lon / c.count,
    lat:   c.lat / c.count,
    count: c.count,
  })).sort((a, b) => b.count - a.count).slice(0, 30)
}
