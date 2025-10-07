import React, { useState, useEffect, useRef } from "react";
import "../styles/TopBar.css";

export default function TopBar() {
  const [headerHeight, setHeaderHeight] = useState(0);
  const topbarRef = useRef(null);

  const [visible, setVisible] = useState(true);
  const lastScrollY = useRef(
    typeof window !== "undefined" ? window.scrollY : 0
  );
  const ticking = useRef(false);

  // Mostrar TopBar solo en desktop (xl ≥ 1280px) para que en tablet/móvil
  // SOLO quede el buscador arriba y nada se tape.
  const [showTopbar, setShowTopbar] = useState(() => {
    try {
      return typeof window !== 'undefined' ? window.innerWidth >= 1280 : true;
    } catch { return true; }
  });

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
        document.documentElement.style.setProperty("--topbar-height", `${th}px`);
        // Offset total de contenido: header + topbar
        document.documentElement.style.setProperty(
          "--content-offset",
          `${h + th}px`
        );
      } catch {}
    };

    measure();
    const resizeHandler = () => {
      try {
        if (typeof window !== 'undefined') {
          setShowTopbar(window.innerWidth >= 1280);
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

  /* --- Mostrar / ocultar al hacer scroll --- */
  useEffect(() => {
    const onScroll = () => {
      if (ticking.current) return;
      ticking.current = true;
      requestAnimationFrame(() => {
        const currentY = window.scrollY;
        const lastY = lastScrollY.current;
        const delta = currentY - lastY;

        if (currentY <= 0) setVisible(true);
        else if (Math.abs(delta) < 5) {
        } else if (delta > 0 && currentY > 60) setVisible(false);
        else if (delta < 0) setVisible(true);

        lastScrollY.current = currentY;
        ticking.current = false;
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const topStyle = {
    position: "fixed",
    left: 0,
    right: 0,
    top: `${headerHeight}px`,
    zIndex: 9990, // debajo del header (z-[9999]) pero encima del contenido
    transform: visible ? "translateY(0)" : "translateY(-110%)",
    transition: "transform 220ms ease, opacity 220ms ease",
    pointerEvents: visible ? "auto" : "none",
    background: "white",
    display: showTopbar ? 'flex' : 'none',
  };

  return (
    <div
      ref={topbarRef}
      style={topStyle}
      className="topbar-base topbar-tech shadow-md px-4 py-2 flex justify-between items-center"
      role="region"
      aria-label="Top bar"
    >
      <div className="flex items-center text-xs sm:text-sm text-gray-800 whitespace-nowrap">
        <span>Sitio oficial de las tiendas de videojuegos de RD</span>
      </div>
    </div>
  );
}
