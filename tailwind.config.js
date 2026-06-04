/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // ── Skåne flag primaries ─────────────────────────────────
        skane: {
          red:  '#C8102E',
          gold: '#FFCD00',
          blue: '#1E3F9E',
        },
        // ── Dark surfaces (red-tinted darks) ─────────────────────
        dash: {
          950: '#0F0608',
          900: '#190B0E',
          800: '#201015',
          700: '#2B1519',
          600: '#3A1E24',
          500: '#4E2A30',
        },
        // ── Visualization accents ────────────────────────────────
        viz: {
          gold:    '#FFCD00',
          red:     '#C8102E',
          blue:    '#4169C8',
          teal:    '#0EA5B0',
          emerald: '#22C55E',
          violet:  '#8B5CF6',
          amber:   '#F59E0B',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
