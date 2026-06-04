/**
 * theme/colors.js  –  Skåne regional flag palette
 *
 *  🟥  Red background : #C8102E
 *  🟨  Gold cross     : #FFCD00
 *  🔵  Blue crown     : #1E3F9E
 */

// ── Skåne flag primaries ──────────────────────────────────────────
export const SKANE_RED  = '#C8102E'
export const SKANE_GOLD = '#FFCD00'
export const SKANE_BLUE = '#1E3F9E'

// ── Dashboard dark surfaces (red-tinted darks) ────────────────────
export const SURFACE = {
  950: '#0F0608',
  900: '#190B0E',
  800: '#201015',
  700: '#2B1519',
  600: '#3A1E24',
  500: '#4E2A30',
}

// ── Data-viz palette ──────────────────────────────────────────────
export const VIZ = {
  gold:    '#FFCD00',  // Skåne gold — primary series
  red:     '#C8102E',  // Skåne red  — alerts / critical
  blue:    '#4169C8',  // Skåne blue tint — secondary
  teal:    '#0EA5B0',  // coastal / beach
  emerald: '#22C55E',  // nature / parks
  violet:  '#8B5CF6',  // events
  amber:   '#F59E0B',  // food / harvest
  softRed: '#E85C75',
}

// ── Tourism-category colours ──────────────────────────────────────
export const TYPE_COLORS = {
  cultural: SKANE_GOLD,   // gold for cultural heritage
  nature:   VIZ.emerald,
  beach:    VIZ.teal,
  food:     VIZ.amber,
  events:   VIZ.violet,
}

// ── Overtourism pressure colours ─────────────────────────────────
export const PRESSURE_COLORS = {
  low:      VIZ.emerald,  // #22C55E
  medium:   SKANE_GOLD,   // #FFCD00
  high:     '#F97316',
  critical: SKANE_RED,    // #C8102E
}

// ── Gradient helpers ──────────────────────────────────────────────
export const GRADIENT = {
  header: 'linear-gradient(135deg, #8B0D1F 0%, #C8102E 45%, #1E3F9E 100%)',
  brand:  'linear-gradient(135deg, #C8102E 0%, #9A0D23 50%, #1E3F9E 100%)',
  heat:   'linear-gradient(90deg, #4169C8, #0EA5B0, #FFCD00, #F97316, #C8102E)',
}
