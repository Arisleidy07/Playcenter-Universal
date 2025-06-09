/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        primary: '#5c059b',
        secondary: '#FBBF24',
        accent: '#EF4444',
        neutral: '#d1d5db',
        'base-100': '#111827'
      }
    }
  },
  plugins: []
}
