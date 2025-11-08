import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import SearchBar from "./SearchBar";
import { useAuth } from "../context/AuthContext";
import { useAuthModal } from "../context/AuthModalContext";
import { useTheme } from "../context/ThemeContext";
import { motion, AnimatePresence } from "framer-motion";
import { FaMapMarkerAlt } from "react-icons/fa";
import Entrega from "./Entrega";

const Header = () => {
  const { usuario, usuarioInfo, logout } = useAuth();
  const { setModalAbierto } = useAuthModal();
  const { isDark } = useTheme();
  const buscarInputRef = useRef(null);
  const navigate = useNavigate();
  const lastScrollY = useRef(0);
  const [headerVisible, setHeaderVisible] = useState(true);
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1280);
  const [menuOpen, setMenuOpen] = useState(false);

  const [modalEntrega, setModalEntrega] = useState(false);
  const entregaSubtitle = (() => {
    try {
      if (!usuario || !usuarioInfo || !usuarioInfo.metodoEntrega) {
        return "Selecciona método de entrega";
      }
      const metodo = (usuarioInfo.metodoEntrega || "").toLowerCase();
      if (metodo === "tienda") return "Recoger en tienda";
      const dir = (usuarioInfo.direccion || "").trim();
      if (!dir) return "Selecciona método de entrega";
      if (/maps\.|google\.com\/maps|Ubicación:/i.test(dir)) {
        return "Dirección de Google Maps";
      }
      // No truncar en el Header: mostrar dirección completa
      return dir;
    } catch {
      return "Selecciona método de entrega";
    }
  })();

  const manejarLogout = async () => {
    try {
      await logout();
      navigate("/");
    } catch (error) {
      console.error("Error cerrando sesión", error);
    }
  };

  useEffect(() => {
    if (buscarInputRef.current) {
      buscarInputRef.current.focus();
    }
  }, []);

  // Detectar cambios de tamaño de pantalla
  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 1280);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Scroll hide/show solo en desktop (xl)
  useEffect(() => {
    if (!isDesktop) return;

    let ticking = false;

    function handleScroll() {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentScroll = window.pageYOffset;
          const lastScroll = lastScrollY.current;

          if (currentScroll > lastScroll && currentScroll > 100) {
            // Bajando y pasó 100px: ocultar
            setHeaderVisible(false);
          } else if (currentScroll < lastScroll || currentScroll === 0) {
            // Subiendo o en top: mostrar
            setHeaderVisible(true);
          }

          lastScrollY.current = currentScroll;
          ticking = false;
        });
        ticking = true;
      }
    }

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isDesktop]);

  return (
    <>
      <motion.header
        initial={{ y: -120, opacity: 0 }}
        animate={{
          y: isDesktop && !headerVisible ? -120 : 0,
          opacity: isDesktop && !headerVisible ? 0 : 1,
        }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="fixed top-0 left-0 w-full shadow-lg z-[9999] pl-0 pr-4 py-3"
        style={{
          backgroundColor: isDark ? "#111827" : "#ffffff",
          maxWidth: "100vw",
          overflowX: "hidden",
          pointerEvents: isDesktop && !headerVisible ? "none" : "auto",
          opacity: 1,
          backdropFilter: "none",
          WebkitBackdropFilter: "none",
        }}
      >
        <div className="flex items-center justify-between w-full gap-3">
          {/* Buscador solo móvil/tablet - Más pequeño */}
          <div id="search-bar-container" className="flex-1 px-2 xl:hidden">
            <SearchBar
              onClose={() => {}}
              ref={buscarInputRef}
              placeholder="Buscar en pcu.com.do"
            />
          </div>

          {/* Botón menú hamburguesa solo móvil/tablet */}
          <button
            onClick={() => setMenuOpen(true)}
            className="xl:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            aria-label="Abrir menú"
          >
            <svg
              className="w-6 h-6 text-gray-700 dark:text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>

          {/* Header completo solo desktop */}
          <div className="hidden xl:flex w-full items-center justify-between gap-2 2xl:gap-4">
            <Link
              to="/"
              className="flex items-center gap-3 min-w-0 flex-shrink-0"
            >
              <img
                src="/Playlogo.png"
                alt="Playcenter Universal"
                className="h-8 2xl:h-10 object-contain"
              />
              {/* Método de entrega (movido al header) */}
              <button
                type="button"
                onClick={() => {
                  if (!usuario) return setModalAbierto(true);
                  setModalEntrega(true);
                }}
                className="flex flex-col leading-tight text-left text-xs text-gray-700 dark:text-white font-medium hover:text-[#0ea5e9] dark:hover:text-[#60a5fa] transition"
              >
                <span className="flex items-center gap-1 text-[10px] 2xl:text-[11px] text-gray-500 dark:text-gray-300">
                  <FaMapMarkerAlt className="text-[#4FC3F7] text-[10px]" />
                  Método de entrega
                </span>
                <strong
                  className="block text-[11px] 2xl:text-[12px] font-semibold text-gray-700 dark:text-white tracking-wide truncate max-w-[100px] 2xl:max-w-[180px]"
                  title={entregaSubtitle}
                >
                  {entregaSubtitle}
                </strong>
              </button>
            </Link>

            <div className="flex-grow max-w-md 2xl:max-w-xl">
              <SearchBar
                onClose={() => {}}
                ref={buscarInputRef}
                placeholder="Buscar en pcu.com.do"
              />
            </div>

            <div className="flex items-center gap-2 xl:gap-3 2xl:gap-4 text-xs xl:text-sm font-medium text-gray-700 dark:text-white flex-shrink-0">
              <Link
                to="/"
                className="nav-link text-gray-700 dark:text-white hover:text-[#4FC3F7] dark:hover:text-[#60a5fa] transition whitespace-nowrap"
              >
                Inicio
              </Link>
              <Link
                to="/categorias"
                className="nav-link text-gray-700 dark:text-white hover:text-[#4FC3F7] dark:hover:text-[#60a5fa] transition whitespace-nowrap"
              >
                Categorías
              </Link>
              <Link
                to="/tiendas"
                className="nav-link text-gray-700 dark:text-white hover:text-[#4FC3F7] dark:hover:text-[#60a5fa] transition whitespace-nowrap"
              >
                Tiendas
              </Link>
              <Link
                to="/vender"
                className="nav-link text-gray-700 dark:text-white hover:text-[#4FC3F7] dark:hover:text-[#60a5fa] transition whitespace-nowrap"
              >
                Vender
              </Link>
              <Link
                to="/nosotros"
                className="nav-link text-gray-700 dark:text-white hover:text-[#4FC3F7] dark:hover:text-[#60a5fa] transition whitespace-nowrap"
              >
                Nosotros
              </Link>
              <Link
                to="/contacto"
                className="nav-link text-gray-700 dark:text-white hover:text-[#4FC3F7] dark:hover:text-[#60a5fa] transition whitespace-nowrap"
              >
                Contáctanos
              </Link>
              <Link
                to="/estafetas"
                className="nav-link text-gray-700 dark:text-white hover:text-[#4FC3F7] dark:hover:text-[#60a5fa] transition whitespace-nowrap"
              >
                Estafetas
              </Link>
              <Link
                to="/carrito"
                className="nav-link text-lg 2xl:text-xl hover:scale-110 transition"
              >
                🛒
              </Link>
              {(usuarioInfo?.isAdmin ||
                usuarioInfo?.isSeller ||
                usuarioInfo?.empresa ||
                usuarioInfo?.empresaId) && (
                <Link
                  to="/admin"
                  className="px-2 xl:px-3 py-1.5 xl:py-2 rounded bg-[#4FC3F7] text-white hover:bg-[#3BB0F3] shadow transition text-xs 2xl:text-sm whitespace-nowrap"
                >
                  Panel Admin
                </Link>
              )}

              {usuario ? (
                <motion.div className="relative" whileTap={{ scale: 0.95 }}>
                  <Link to="/profile">
                    <div className="w-8 h-8 2xl:w-10 2xl:h-10 rounded-full overflow-hidden border-2 border-[#4FC3F7] shadow hover:shadow-lg transition cursor-pointer bg-white dark:bg-gray-700">
                      {usuario.photoURL ? (
                        <img
                          src={usuario.photoURL}
                          alt="Perfil"
                          className="w-full h-full object-cover rounded-full"
                        />
                      ) : (
                        <div className="w-full h-full bg-[#4FC3F7] text-white flex items-center justify-center font-bold text-sm 2xl:text-base">
                          {usuario.displayName?.charAt(0).toUpperCase() || "U"}
                        </div>
                      )}
                    </div>
                  </Link>
                </motion.div>
              ) : (
                <motion.button
                  onClick={() => setModalAbierto(true)}
                  className="px-3 xl:px-4 py-1.5 xl:py-2 text-xs 2xl:text-sm bg-[#4FC3F7] hover:bg-[#3BB0F3] text-white rounded-lg font-semibold shadow transition whitespace-nowrap"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Iniciar sesión
                </motion.button>
              )}
            </div>
          </div>
        </div>
      </motion.header>

      {/* Botón admin en móvil */}
      {(usuarioInfo?.isAdmin ||
        usuarioInfo?.isSeller ||
        usuarioInfo?.empresa ||
        usuarioInfo?.empresaId) && (
        <div className="xl:hidden fixed bottom-[80px] right-4 z-[9999]">
          <Link
            to="/admin"
            className="bg-[#4FC3F7] hover:bg-[#3BB0F3] text-white px-5 py-3 rounded-full shadow-xl font-semibold text-base"
          >
            Panel Admin
          </Link>
        </div>
      )}

      {/* Modal de entrega (desde header) */}
      {modalEntrega && usuario && (
        <Entrega
          abierto={modalEntrega}
          onClose={() => setModalEntrega(false)}
          usuarioId={usuarioInfo?.uid || usuario?.uid}
          direccionEditar={null}
          actualizarLista={() => {}}
        />
      )}

      {/* Menú lateral móvil/tablet */}
      <AnimatePresence>
        {menuOpen && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMenuOpen(false)}
              className="xl:hidden fixed inset-0 bg-black/50 z-[99999] backdrop-blur-sm"
            />

            {/* Menú drawer */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="xl:hidden fixed top-0 right-0 h-full w-80 bg-white dark:bg-gray-900 shadow-2xl z-[999999] overflow-y-auto"
            >
              {/* Header del menú */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Menú
                </h2>
                <button
                  onClick={() => setMenuOpen(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                  aria-label="Cerrar menú"
                >
                  <svg
                    className="w-6 h-6 text-gray-700 dark:text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              {/* Perfil o Login */}
              {usuario ? (
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                  <Link
                    to="/profile"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-3 p-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                  >
                    <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-[#4FC3F7] shadow bg-white dark:bg-gray-700">
                      {usuario.photoURL ? (
                        <img
                          src={usuario.photoURL}
                          alt="Perfil"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-[#4FC3F7] text-white flex items-center justify-center font-bold text-lg">
                          {usuario.displayName?.charAt(0).toUpperCase() || "U"}
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {usuario.displayName || "Usuario"}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Ver perfil
                      </p>
                    </div>
                    <svg
                      className="w-5 h-5 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </Link>
                </div>
              ) : (
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      setModalAbierto(true);
                    }}
                    className="w-full px-4 py-3 bg-[#4FC3F7] hover:bg-[#3BB0F3] text-white rounded-lg font-semibold shadow-md transition-all flex items-center justify-center gap-2"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                      />
                    </svg>
                    Iniciar sesión
                  </button>
                </div>
              )}

              {/* Links de navegación */}
              <nav className="p-2">
                <Link
                  to="/"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors font-medium"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                    />
                  </svg>
                  Inicio
                </Link>

                <Link
                  to="/categorias"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors font-medium"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                    />
                  </svg>
                  Categorías
                </Link>

                <Link
                  to="/tiendas"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors font-medium"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                    />
                  </svg>
                  Tiendas
                </Link>

                <Link
                  to="/vender"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors font-medium"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  Vender
                </Link>

                <Link
                  to="/nosotros"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors font-medium"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  Nosotros
                </Link>

                <Link
                  to="/contacto"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors font-medium"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                  Contáctanos
                </Link>

                <Link
                  to="/estafetas"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors font-medium"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  Estafetas
                </Link>

                <Link
                  to="/carrito"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors font-medium"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                  Carrito
                </Link>

                {/* Panel Admin si aplica */}
                {(usuarioInfo?.isAdmin ||
                  usuarioInfo?.isSeller ||
                  usuarioInfo?.empresa ||
                  usuarioInfo?.empresaId) && (
                  <Link
                    to="/admin"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 bg-[#4FC3F7] text-white hover:bg-[#3BB0F3] rounded-lg transition-colors font-semibold mt-2"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    Panel Admin
                  </Link>
                )}
              </nav>

              {/* Footer del menú con logout si está logueado */}
              {usuario && (
                <div className="p-4 border-t border-gray-200 dark:border-gray-700 mt-auto">
                  <button
                    onClick={() => {
                      manejarLogout();
                      setMenuOpen(false);
                    }}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors font-medium"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                      />
                    </svg>
                    Cerrar sesión
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Header;
