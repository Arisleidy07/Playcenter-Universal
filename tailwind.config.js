/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      animation: {
        'blob-bounce': 'blobBounce 5s infinite ease',
        'slide-in-left': 'slideInLeft 0.5s ease-out',
      },
      keyframes: {
        blobBounce: {
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
      colors: {
        primary: '#0f172a',        // Azul noche, fondo header y secciones
        secondary: '#22d3ee',      // Cyan neón para iconos, hover y detalles
        accent: '#7c3aed',         // Violeta neón para links hover y botones
        highlight: '#38bdf8',      // Azul celeste vibrante para textos importantes
        warning: '#fbbf24',        // Amarillo para alertas o toques warm
        danger: '#ef4444',         // Rojo para errores o botones de cancelar
        neutral: '#ffffff',        // Blanco puro para texto y fondo claro
        base100: '#111827',        // Gris oscuro para fondos secundarios
        cardBg: 'linear-gradient(145deg, #1e1b4b, #111827)', // Fondo gradiente tarjetas
      },
    },
  },
  plugins: [],
}
