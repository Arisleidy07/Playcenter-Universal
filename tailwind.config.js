/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      theme: {
  extend: {
    animation: {
      'blob-bounce': 'blob-bounce 5s infinite ease',
      'slide-in-left': 'slideInLeft 0.5s ease-out',
    },
    keyframes: {
      'blob-bounce': {
        '0%': { transform: 'translate(-100%, -100%) translate3d(0, 0, 0)' },
        '25%': { transform: 'translate(-100%, -100%) translate3d(100%, 0, 0)' },
        '50%': { transform: 'translate(-100%, -100%) translate3d(100%, 100%, 0)' },
        '75%': { transform: 'translate(-100%, -100%) translate3d(0, 100%, 0)' },
        '100%': { transform: 'translate(-100%, -100%) translate3d(0, 0, 0)' },
      },
      slideInLeft: {
        '0%': { transform: 'translateX(-50%)', opacity: '0' },
        '100%': { transform: 'translateX(0)', opacity: '1' },
      },
    },
  },
}

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
