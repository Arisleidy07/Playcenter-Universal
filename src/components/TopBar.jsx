import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useCategories } from "../hooks/useProducts";
import { normalizar } from "../utils/normalizarCategoria";
import { useTheme } from "../context/ThemeContext";
import { FiArrowLeft } from "react-icons/fi";
import "../styles/TopBar.css";
import "../styles/ThemeToggle.css";

export default function TopBar() {
  const { categories } = useCategories();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  // Mostrar TopBar solo en móvil (<768px)
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" ? window.innerWidth < 768 : true
  );

  // Detectar cambios de tamaño para mostrar/ocultar TopBar
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const topStyle = {
    // Ya no necesitamos fixed - el contenedor sticky en App.jsx maneja la posición
    display: "flex",
    margin: 0,
    padding: 0,
    borderTop: "none",
    marginTop: 0,
  };

  // Ocultar TopBar en tablet y desktop (>=768px)
  if (!isMobile) {
    return null;
  }

  return (
    <div
      style={{
        ...topStyle,
        padding: "0.25rem 0.5rem",
        margin: 0,
        background:
          theme === "dark"
            ? "linear-gradient(to right, #1e3a8a, #1e40af, #1e3a8a)"
            : "#ffffff",
        color: theme === "dark" ? "#e5e7eb" : "#374151",
      }}
      className="flex topbar-base topbar-tech shadow-md justify-between items-center transition-colors duration-300"
      role="region"
      aria-label="Top bar"
    >
      <div
        className="flex items-center gap-2 text-[10px] sm:text-xs md:text-sm whitespace-nowrap theme-text"
        style={{ color: theme === "dark" ? "#e5e7eb" : "#374151" }}
      >
        {/* Flecha de retroceso - SOLO visible en Vista Producto */}
        {(location.pathname.startsWith("/producto/") ||
          location.pathname.startsWith("/Producto/")) && (
          <button
            onClick={() => navigate(-1)}
            className="flex items-center justify-center w-7 h-7 rounded-full bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-all duration-200 hover:scale-110 active:scale-95 shadow-sm hover:shadow-md"
            aria-label="Volver atrás"
          >
            <FiArrowLeft className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          </button>
        )}
        <span>Sitio oficial de las tiendas de videojuegos en RD</span>
      </div>

      {/* Theme Toggle - Botón Luna/Sol */}
      <div className="flex items-center gap-2">
        <label className="theme-toggle">
          <input
            type="checkbox"
            checked={theme === "dark"}
            onChange={toggleTheme}
            className="theme-toggle__input"
            aria-label="Cambiar tema"
          />
          <svg
            className="theme-toggle__icon theme-toggle__icon--sun"
            fill="none"
            height="18"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            width="18"
          >
            <circle cx="12" cy="12" r="5"></circle>
            <line x1="12" x2="12" y1="1" y2="3"></line>
            <line x1="12" x2="12" y1="21" y2="23"></line>
            <line x1="4.22" x2="5.64" y1="4.22" y2="5.64"></line>
            <line x1="18.36" x2="19.78" y1="18.36" y2="19.78"></line>
            <line x1="1" x2="3" y1="12" y2="12"></line>
            <line x1="21" x2="23" y1="12" y2="12"></line>
            <line x1="4.22" x2="5.64" y1="19.78" y2="18.36"></line>
            <line x1="18.36" x2="19.78" y1="5.64" y2="4.22"></line>
          </svg>
          <svg
            className="theme-toggle__icon theme-toggle__icon--moon"
            viewBox="0 0 24 24"
          >
            <path d="m12.3 4.9c.4-.2.6-.7.5-1.1s-.6-.8-1.1-.8c-4.9.1-8.7 4.1-8.7 9 0 5 4 9 9 9 3.8 0 7.1-2.4 8.4-5.9.2-.4 0-.9-.4-1.2s-.9-.2-1.2.1c-1 .9-2.3 1.4-3.7 1.4-3.1 0-5.7-2.5-5.7-5.7 0-1.9 1.1-3.8 2.9-4.8zm2.8 12.5c.5 0 1 0 1.4-.1-1.2 1.1-2.8 1.7-4.5 1.7-3.9 0-7-3.1-7-7 0-2.5 1.4-4.8 3.5-6-.7 1.1-1 2.4-1 3.8-.1 4.2 3.4 7.6 7.6 7.6z"></path>
          </svg>
        </label>
      </div>
    </div>
  );
}
