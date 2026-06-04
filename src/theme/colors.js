/**
 * theme/colors.js  –  Summer / Österlen tourism palette
 *
 *  🟠  Orange  #FF6B35  – primary accent (sunsets, warmth)
 *  🔵  Cyan    #06B6D4  – Baltic coast, water
 *  🟡  Amber   #F59E0B  – harvest, food, sand
 *  🟢  Emerald #10B981  – nature, parks
 *  🟣  Violet  #8B5CF6  – events, festivals
 */

// ── Primary accents ───────────────────────────────────────────────
export const ORANGE  = '#FF6B35'
export const CYAN    = '#06B6D4'
export const AMBER   = '#F59E0B'
export const EMERALD = '#10B981'
export const VIOLET  = '#8B5CF6'

// ── Dashboard dark surfaces (deep navy / slate) ───────────────────
export const SURFACE = {
  900: '#0D1117',
  800: '#161D2B',
  700: '#1E2840',
  600: '#2D3A52',
  500: '#3D4F6E',
}

// ── Data-viz palette ──────────────────────────────────────────────
export const VIZ = {
  orange:  '#FF6B35',
  cyan:    '#06B6D4',
  emerald: '#10B981',
  amber:   '#F59E0B',
  violet:  '#8B5CF6',
  rose:    '#F43F5E',
}

// ── Tourism-category colours ──────────────────────────────────────
export const TYPE_COLORS = {
  cultural: AMBER,
  nature:   EMERALD,
  beach:    CYAN,
  food:     ORANGE,
  events:   VIOLET,
}

// ── Overtourism pressure colours ─────────────────────────────────
export const PRESSURE_COLORS = {
  low:      '#10B981',
  medium:   '#F59E0B',
  high:     '#F97316',
  critical: '#EF4444',
}

// ── Gradient helpers ──────────────────────────────────────────────
export const GRADIENT = {
  header: 'linear-gradient(135deg, #FF6B35 0%, #F59E0B 45%, #06B6D4 100%)',
  brand:  'linear-gradient(135deg, #FF6B35 0%, #F97316 50%, #06B6D4 100%)',
  heat:   'linear-gradient(90deg, #06B6D4, #10B981, #F59E0B, #F97316, #EF4444)',
}
