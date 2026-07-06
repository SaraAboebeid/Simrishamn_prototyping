export function countVisitsByNearestAttraction(visits, attractions, maxDistanceDeg = 0.015) {
  const counts = {}
  attractions.forEach(a => { counts[a.id] = 0 })

  if (!visits?.length || !attractions?.length) return counts

  visits.forEach(v => {
    let nearestId = null
    let bestDist = Number.POSITIVE_INFINITY

    attractions.forEach(a => {
      const dLat = v.lat - a.coords[0]
      const dLon = v.lon - a.coords[1]
      const dist = Math.sqrt(dLat * dLat + dLon * dLon)
      if (dist < bestDist) {
        bestDist = dist
        nearestId = a.id
      }
    })

    if (nearestId && bestDist <= maxDistanceDeg) counts[nearestId]++
  })

  return counts
}
