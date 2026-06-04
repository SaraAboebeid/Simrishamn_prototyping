// ──────────────────────────────────────────────────────────────────
//  Simrishamn Tourism Dashboard · Location data
//  All attractions scoped to Simrishamn town & immediate surroundings.
// ──────────────────────────────────────────────────────────────────
import { TYPE_COLORS } from '../theme/colors'

// Colours sourced from theme/colors.js (summer palette)
export const TOURISM_TYPES = [
  { id: 'cultural', label: 'Cultural & Heritage', color: TYPE_COLORS.cultural, icon: '🏙️' },
  { id: 'nature',   label: 'Nature & Parks',      color: TYPE_COLORS.nature,   icon: '🌿' },
  { id: 'beach',    label: 'Beaches & Coast',     color: TYPE_COLORS.beach,    icon: '🏖️' },
  { id: 'food',     label: 'Food & Drink',        color: TYPE_COLORS.food,     icon: '🍎' },
  { id: 'events',   label: 'Events & Markets',    color: TYPE_COLORS.events,   icon: '🎤' },
]

// ── Attraction points — Simrishamn town area only ─────────────────
export const attractions = [
  {
    id: 'simrishamns-hamn',
    name: 'Simrishamns Hamn',
    type: 'cultural',
    coords: [55.5558, 14.3551],
    description: 'The active fishing and leisure harbour — heart of town life, boat tours, fish stalls and Österlen atmosphere.',
    rating: 4.6, capacityPerDay: 6000, pressureLevel: 'medium', area: 'Simrishamn',
  },
  {
    id: 'skansen-simrishamn',
    name: 'Skansen & Hamnplanen',
    type: 'cultural',
    coords: [55.5562, 14.3540],
    description: 'Historic fortification area and harbour square — open-air events, summer concerts and sea views.',
    rating: 4.3, capacityPerDay: 3000, pressureLevel: 'medium', area: 'Simrishamn',
  },
  {
    id: 'sankta-nikolai',
    name: 'Sankta Nikolai Kyrka',
    type: 'cultural',
    coords: [55.5573, 14.3515],
    description: 'Medieval 13th-century sandstone church at the heart of the old town — the spiritual landmark of Simrishamn.',
    rating: 4.5, capacityPerDay: 800, pressureLevel: 'medium', area: 'Simrishamn',
  },
  {
    id: 'osterlenmuseet',
    name: 'Österlenmuseet',
    type: 'cultural',
    coords: [55.5570, 14.3505],
    description: "Local history and art museum covering Österlen's fishing heritage, maritime culture and regional art.",
    rating: 4.1, capacityPerDay: 600, pressureLevel: 'low', area: 'Simrishamn',
  },
  {
    id: 'lillepark',
    name: 'Lillepark',
    type: 'nature',
    coords: [55.5580, 14.3488],
    description: 'Charming town park with walking paths, sea views and summer picnic lawns just steps from the old town.',
    rating: 4.2, capacityPerDay: 2000, pressureLevel: 'low', area: 'Simrishamn',
  },
  {
    id: 'tobisvik',
    name: 'Tobisvik Badplats',
    type: 'beach',
    coords: [55.5748, 14.3338],
    description: 'Sandy bay beach north of town with calm Baltic water, popular with families and campers in summer.',
    rating: 4.4, capacityPerDay: 3500, pressureLevel: 'medium', area: 'Tobisvik',
  },
  {
    id: 'sarpens-udde',
    name: 'Sarpens Udde',
    type: 'beach',
    coords: [55.5428, 14.3710],
    description: 'Windswept coastal headland south of town with rocky shores, wild beach and excellent birdwatching.',
    rating: 4.3, capacityPerDay: 1500, pressureLevel: 'low', area: 'Simrishamn',
  },
  {
    id: 'autoseum',
    name: 'Autoseum – Nisse Nilsson',
    type: 'cultural',
    coords: [55.5508, 14.3420],
    description: 'Unique private car museum with legendary Swedish rally driver Nisse Nilsson\'s collection of historic race cars.',
    rating: 4.4, capacityPerDay: 500, pressureLevel: 'low', area: 'Simrishamn',
  },
  {
    id: 'brantevik',
    name: 'Brantevik',
    type: 'cultural',
    coords: [55.5167, 14.3333],
    description: 'Picturesque fishing village 4 km south — departure point of the 1869 emigrant ship. Red cottages, calm harbour.',
    rating: 4.5, capacityPerDay: 800, pressureLevel: 'high', area: 'Brantevik',
  },
]

// ── Overtourism zone polygons — Simrishamn area only ──────────────
export const overtourismZones = [
  {
    id: 'hamn-zone',
    name: 'Harbour Peak Zone',
    level: 'high',
    coords: [[55.558,14.352],[55.558,14.358],[55.553,14.358],[55.553,14.352]],
    issue: 'Harbour & Skansen area reaches capacity on summer evenings and market weekends',
  },
  {
    id: 'brantevik-zone',
    name: 'Brantevik Harbour Zone',
    level: 'high',
    coords: [[55.521,14.325],[55.521,14.343],[55.512,14.343],[55.512,14.325]],
    issue: 'Village capacity exceeded on summer weekends',
  },
  {
    id: 'tobisvik-zone',
    name: 'Tobisvik Beach Zone',
    level: 'medium',
    coords: [[55.578,14.330],[55.578,14.340],[55.571,14.340],[55.571,14.330]],
    issue: 'Beach parking overflow on hot summer days',
  },
]

// ── Derived helpers ───────────────────────────────────────────────

export function getFilteredAttractions(selectedTypes) {
  return attractions.filter(a => selectedTypes.includes(a.type))
}

export function formatVisitors(n) {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`
  if (n >= 1000)    return `${(n / 1000).toFixed(0)}K`
  return String(n)
}
