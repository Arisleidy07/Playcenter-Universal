// src/components/TopBar.jsx
import React, { useState, useEffect, useRef } from "react";
import { MapPin, ChevronDown } from "lucide-react";
import Entrega from "./Entrega";
import { useAuth } from "../context/AuthContext";
import ModalLoginAlert from "./ModalLoginAlert"; // 🔹 Igual que en TarjetaProducto
import { useAuthModal } from "../context/AuthModalContext"; // 🔹 Para abrir el modal de login

export default function TopBar() {
  const { usuarioInfo } = useAuth();
  const { abrirModal } = useAuthModal();

  const [modalEntrega, setModalEntrega] = useState(false);
  const [modalAlertaAbierto, setModalAlertaAbierto] = useState(false); // 🔹 Nuevo
  const [textoEntrega, setTextoEntrega] = useState("Selecciona método de entrega");
  const [headerHeight, setHeaderHeight] = useState(0);
  const topbarRef = useRef(null);

  const [visible, setVisible] = useState(true);
  const lastScrollY = useRef(typeof window !== "undefined" ? window.scrollY : 0);
  const ticking = useRef(false);

  /* --- Ajustar el texto según la info del usuario --- */
  useEffect(() => {
    if (!usuarioInfo) {
      setTextoEntrega("Selecciona método de entrega");
      return;
    }

    if (usuarioInfo.metodoEntrega === "tienda") {
      setTextoEntrega("Recoger en: Playcenter Universal Santiago");
    } else if (usuarioInfo.metodoEntrega === "domicilio" && usuarioInfo.direccion) {
      setTextoEntrega(`Entregar en: ${usuarioInfo.direccion}`);
    } else {
      setTextoEntrega("Selecciona método de entrega");
    }
  }, [usuarioInfo]);

  /* --- Detectar altura del header dinámicamente --- */
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
    zIndex: 900,
    transform: visible ? "translateY(0)" : "translateY(-110%)",
    transition: "transform 220ms ease, opacity 220ms ease",
    pointerEvents: visible ? "auto" : "none",
    background: "white",
  };

  /* --- Manejo de click según login --- */
  const handleClickEntrega = () => {
    if (!usuarioInfo) {
      setModalAlertaAbierto(true); // 🔹 Mostrar alerta si no hay sesión
    } else {
      setModalEntrega(true); // 🔹 Abrir modal de entrega si hay sesión
    }
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
          onClick={handleClickEntrega}
        >
          <MapPin className="w-5 h-5 text-gray-700" />
          {/* 🔹 Texto con tamaño responsivo (más pequeño en móvil/tablet) */}
          <span className="font-semibold text-gray-800 max-w-[220px] sm:max-w-[280px] md:max-w-[350px] truncate text-sm sm:text-base">
            {textoEntrega}
          </span>
          <ChevronDown className="w-5 h-5 text-gray-600" />
        </div>
      </div>

      {/* Modal de entrega */}
      {modalEntrega && usuarioInfo && (
        <Entrega
          abierto={modalEntrega}
          onClose={() => setModalEntrega(false)}
          usuarioId={usuarioInfo?.uid}
          direccionEditar={null}
          actualizarLista={() => {}}
        />
      )}

      {/* Modal de login (alerta + opción abrir AuthModal) */}
      <ModalLoginAlert
        isOpen={modalAlertaAbierto}
        onClose={() => setModalAlertaAbierto(false)}
        onIniciarSesion={() => {
          setModalAlertaAbierto(false);
          abrirModal(); // 🔹 Abre el AuthModal
        }}
      />
    </>
  );
}
