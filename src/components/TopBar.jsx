// src/components/TopBar.jsx
import React, { useState, useEffect, useRef } from "react";
import { MapPin, ChevronDown } from "lucide-react";
import Entrega from "./Entrega";
import { useAuth } from "../context/AuthContext";

export default function TopBar() {
  const { usuarioInfo } = useAuth();
  const [modalEntrega, setModalEntrega] = useState(false);
  const [textoEntrega, setTextoEntrega] = useState("Selecciona método de entrega");
  const [headerHeight, setHeaderHeight] = useState(0);
  const topbarRef = useRef(null);

  const [visible, setVisible] = useState(true);
  const lastScrollY = useRef(typeof window !== "undefined" ? window.scrollY : 0);
  const ticking = useRef(false);

  useEffect(() => {
    if (!usuarioInfo) return;
    if (usuarioInfo.metodoEntrega === "tienda") {
      setTextoEntrega("Recoger en: Playcenter Universal Santiago");
    } else if (usuarioInfo.metodoEntrega === "domicilio" && usuarioInfo.direccion) {
      setTextoEntrega(`Entregar en: ${usuarioInfo.direccion}`);
    } else {
      setTextoEntrega("Selecciona método de entrega");
    }
  }, [usuarioInfo]);

  useEffect(() => {
    const measure = () => {
      const headerEl = document.querySelector("header");
      const h = headerEl ? Math.ceil(headerEl.getBoundingClientRect().height) : 0;
      setHeaderHeight(h);
    };

    measure();
    const resizeHandler = () => measure();
    window.addEventListener("resize", resizeHandler);

    const observer = new MutationObserver(() => measure());
    observer.observe(document.body, { childList: true, subtree: true, attributes: true });

    return () => {
      window.removeEventListener("resize", resizeHandler);
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    const onScroll = () => {
      if (ticking.current) return;
      ticking.current = true;
      requestAnimationFrame(() => {
        const currentY = window.scrollY;
        const lastY = lastScrollY.current;
        const delta = currentY - lastY;

        if (currentY <= 0) setVisible(true);
        else if (Math.abs(delta) < 5) {}
        else if (delta > 0 && currentY > 60) setVisible(false);
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
    zIndex: 900,
    transform: visible ? "translateY(0)" : "translateY(-110%)",
    transition: "transform 220ms ease, opacity 220ms ease",
    pointerEvents: visible ? "auto" : "none",
    background: "white",
  };

  return (
    <>
      <div
        ref={topbarRef}
        style={topStyle}
        className="shadow-md px-4 py-2 flex justify-between items-center"
      >
        <div
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => setModalEntrega(true)}
        >
          <MapPin className="w-5 h-5 text-gray-700" />
          <span className="font-semibold text-gray-800 max-w-[200px] truncate">
            {textoEntrega}
          </span>
          <ChevronDown className="w-5 h-5 text-gray-600" />
        </div>
      </div>

      {modalEntrega && (
        <Entrega
          abierto={modalEntrega}
          onClose={() => setModalEntrega(false)}
          usuarioId={usuarioInfo?.uid}
          direccionEditar={null}
          actualizarLista={() => {}}
        />
      )}
    </>
  );
}
