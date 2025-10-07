/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    animation: {
      bounce: "bounce 2s infinite",
      pulse: "pulse 2s infinite",
    },
    extend: {
      animation: {
        "blob-bounce": "blobBounce 5s infinite ease",
        "slide-in-left": "slideInLeft 0.5s ease-out",
      },
      keyframes: {
        blobBounce: {
          "0%": { transform: "translate(-100%, -100%) translate3d(0, 0, 0)" },
          "25%": {
            transform: "translate(-100%, -100%) translate3d(100%, 0, 0)",
          },
          "50%": {
            transform: "translate(-100%, -100%) translate3d(100%, 100%, 0)",
          },
          "75%": {
            transform: "translate(-100%, -100%) translate3d(0, 100%, 0)",
          },
          "100%": { transform: "translate(-100%, -100%) translate3d(0, 0, 0)" },
        },
        slideInLeft: {
          "0%": { transform: "translateX(-50%)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" },
        },
      },
      colors: {
        primary: "#0f172a",
        secondary: "#22d3ee",
        accent: "#7c3aed",
        highlight: "#38bdf8",
        warning: "#fbbf24",
        danger: "#ef4444",
        neutral: "#ffffff",
        base100: "#111827",
        cardBg: "linear-gradient(145deg, #1e1b4b, #111827)",
      },
    },
  },
  plugins: [],
};
