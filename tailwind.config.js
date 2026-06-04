/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        tourism: {
          orange:  '#d9341e',
          cyan:    '#06B6D4',
          emerald: '#10B981',
          amber:   '#F59E0B',
          violet:  '#8B5CF6',
          rose:    '#F43F5E',
        },
        dash: {
          900: '#0D1117',
          800: '#161D2B',
          700: '#1E2840',
          600: '#2D3A52',
          500: '#3D4F6E',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
