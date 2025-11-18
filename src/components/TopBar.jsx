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

  const [headerHeight, setHeaderHeight] = useState(0);
  const topbarRef = useRef(null);

  const [visible, setVisible] = useState(true);
  const lastScrollY = useRef(
    typeof window !== "undefined" ? window.scrollY : 0
  );
  const ticking = useRef(false);

  // Mostrar TopBar en desktop (xl ≥ 1280px)
  const [showTopbar, setShowTopbar] = useState(window.innerWidth >= 1280);
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1280);

  // Sin método de entrega aquí: movido al Header

  /* --- Detectar altura del header dinámicamente --- */
  useEffect(() => {
    const measure = () => {
      const headerEl = document.querySelector("header");
      const h = headerEl
        ? Math.ceil(headerEl.getBoundingClientRect().height)
        : 0;
      setHeaderHeight(h);
      // Exponer altura de TopBar (propia) mediante CSS var para páginas que necesiten offset
      try {
        const topbarEl = topbarRef.current;
        const th = topbarEl
          ? Math.ceil(topbarEl.getBoundingClientRect().height)
          : 0;
        document.documentElement.style.setProperty(
          "--topbar-height",
          `${th}px`
        );
        // Offset total de contenido: header + topbar
        const totalOffset = h + th;
        document.documentElement.style.setProperty(
          "--content-offset",
          `${totalOffset}px`
        );
        // Content offset calculado
      } catch {}
    };

    measure();
    const resizeHandler = () => {
      try {
        if (typeof window !== "undefined") {
          const isDesktopNow = window.innerWidth >= 1280;
          setShowTopbar(isDesktopNow);
          setIsDesktop(isDesktopNow);
        }
      } catch {}
      measure();
    };
    let ro = null;

    try {
      if (typeof window !== "undefined" && "ResizeObserver" in window) {
        ro = new ResizeObserver(() => measure());
        const headerEl = document.querySelector("header");
        if (headerEl) ro.observe(headerEl);
        if (topbarRef.current) ro.observe(topbarRef.current);
      } else {
        window.addEventListener("resize", resizeHandler);
      }
    } catch {
      window.addEventListener("resize", resizeHandler);
    }

    return () => {
      if (ro) {
        try {
          ro.disconnect();
        } catch {}
      }
      window.removeEventListener("resize", resizeHandler);
    };
  }, []);

  /* --- Mostrar / ocultar al hacer scroll (solo desktop) --- */
  useEffect(() => {
    if (!isDesktop) {
      setVisible(true);
      return;
    }

    const onScroll = () => {
      if (!ticking.current) {
        window.requestAnimationFrame(() => {
          const currentY = window.scrollY;
          const lastY = lastScrollY.current;

          if (currentY > lastY && currentY > 100) {
            // Bajando y pasó 100px: ocultar
            setVisible(false);
          } else if (currentY < lastY || currentY === 0) {
            // Subiendo o en top: mostrar
            setVisible(true);
          }

          lastScrollY.current = currentY;
          ticking.current = false;
        });
        ticking.current = true;
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [isDesktop]);

  const topStyle = {
    position: "fixed",
    left: 0,
    right: 0,
    top: `${headerHeight}px`,
    zIndex: 9990,
    transform: visible ? "translateY(0)" : "translateY(-110%)",
    transition: "transform 220ms ease, opacity 220ms ease",
    pointerEvents: visible ? "auto" : "none",
    display: "flex",
    margin: 0,
    padding: 0,
    borderTop: "none", // Sin border superior
    marginTop: 0, // Sin margin superior
  };

  return (
    <div
      ref={topbarRef}
      style={{ ...topStyle, padding: "0.25rem 0.5rem", margin: 0 }}
      className="flex topbar-base topbar-tech bg-white dark:bg-gradient-to-r dark:from-blue-900 dark:via-blue-800 dark:to-blue-900 shadow-md justify-between items-center transition-colors duration-300"
      role="region"
      aria-label="Top bar"
    >
      <div className="flex items-center gap-2 text-[10px] sm:text-xs md:text-sm whitespace-nowrap theme-text text-gray-700 dark:text-gray-200">
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
