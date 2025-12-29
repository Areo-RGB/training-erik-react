/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: '#0B0E14',
        surface: '#151A23',
        'surface-hover': '#1E2532',
        subtle: '#2A3441',
        primary: '#F1F5F9',
        secondary: '#94A3B8',
        action: '#3B82F6',
        success: '#10B981',
        icon: '#64748B',
        'muted-red': '#EF4444',
        'muted-orange': '#F97316',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
