import React, { useState, useEffect, useRef } from "react";
import { MapPin, ChevronDown } from "lucide-react";
import Entrega from "./Entrega";
import { useAuth } from "../context/AuthContext";
import ModalLoginAlert from "./ModalLoginAlert";
import { useAuthModal } from "../context/AuthModalContext";
import Anim2 from "./anim2";
import { motion } from "framer-motion";

export default function TopBar() {
  const { usuarioInfo } = useAuth();
  const { abrirModal } = useAuthModal();

  const [modalEntrega, setModalEntrega] = useState(false);
  const [modalAlertaAbierto, setModalAlertaAbierto] = useState(false);
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
      setModalAlertaAbierto(true);
    } else {
      setModalEntrega(true);
    }
  };

  return (
    <>
      <div
        ref={topbarRef}
        style={topStyle}
        className="shadow-md px-4 py-2 flex justify-between items-center"
      >
        {/* IZQUIERDA: método de entrega con animaciones */}
        <motion.div
          className="flex items-center gap-2 cursor-pointer group"
          onClick={handleClickEntrega}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
        >
          <motion.div
            whileHover={{ rotate: -10 }}
            className="p-1.5 rounded-full bg-gray-100 group-hover:bg-blue-100 transition"
          >
            <MapPin className="w-5 h-5 text-gray-700 group-hover:text-blue-600 transition" />
          </motion.div>
          <motion.span
            className="font-semibold text-gray-800 
                       max-w-[220px] sm:max-w-[280px] md:max-w-[350px] 
                       truncate text-sm sm:text-base tracking-wide"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            {textoEntrega}
          </motion.span>
          <motion.div
            animate={{ y: [0, -3, 0] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
          >
            <ChevronDown className="w-5 h-5 text-gray-600 group-hover:text-blue-600 transition" />
          </motion.div>
        </motion.div>

        {/* DERECHA: Anim2 (sin tocarlo) */}
        <Anim2 />
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

      {/* Modal de login */}
      <ModalLoginAlert
        isOpen={modalAlertaAbierto}
        onClose={() => setModalAlertaAbierto(false)}
        onIniciarSesion={() => {
          setModalAlertaAbierto(false);
          abrirModal();
        }}
      />
    </>
  );
}
