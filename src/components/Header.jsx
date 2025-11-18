import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import SearchBar from "./SearchBar";
import { useAuth } from "../context/AuthContext";
import { useAuthModal } from "../context/AuthModalContext";
import { useTheme } from "../context/ThemeContext";
import { motion, AnimatePresence } from "framer-motion";
import { FaMapMarkerAlt } from "react-icons/fa";
import Entrega from "./Entrega";
import "./Header.css";

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
      // Intentar enfocar, si el SearchBar soporta forwarded ref
      try {
        buscarInputRef.current.focus();
      } catch {}
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
        initial={{ y: -80, opacity: 0 }}
        animate={{
          y: isDesktop && !headerVisible ? -80 : 0,
          opacity: isDesktop && !headerVisible ? 0 : 1,
        }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="navbar navbar-expand-xl fixed-top"
        style={{
          background: isDark
            ? "linear-gradient(135deg, rgba(17, 24, 39, 0.98) 0%, rgba(31, 41, 55, 0.98) 100%)"
            : "linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(249, 250, 251, 0.98) 100%)",
          backdropFilter: "blur(20px) saturate(180%)",
          WebkitBackdropFilter: "blur(20px) saturate(180%)",
          borderBottom: isDark
            ? "1px solid rgba(59, 130, 246, 0.15)"
            : "1px solid rgba(59, 130, 246, 0.12)",
          boxShadow: isDark
            ? "0 4px 32px rgba(0, 0, 0, 0.5), 0 0 48px rgba(59, 130, 246, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.05)"
            : "0 2px 24px rgba(0, 0, 0, 0.08), 0 0 48px rgba(59, 130, 246, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.8)",
          zIndex: 9999,
          pointerEvents: isDesktop && !headerVisible ? "none" : "auto",
          paddingLeft: isDesktop ? "1.5rem" : "0",
          paddingRight: isDesktop ? "1.5rem" : "0",
          paddingTop: "0.75rem",
          paddingBottom: "0.75rem",
          height: "64px",
        }}
      >
        <div className="container-fluid">
          <div className="d-flex align-items-center justify-content-between w-100">
            {/* Buscador solo móvil/tablet - Más pequeño */}
            <div
              id="search-bar-container"
              className="flex-grow-1 px-0 d-lg-none"
            >
              <SearchBar
                onClose={() => {}}
                ref={buscarInputRef}
                placeholder="Buscar en pcu.com.do"
              />
            </div>

            {/* Botón menú hamburguesa - responsive */}
            <button
              onClick={() => setMenuOpen(true)}
              className="navbar-toggler d-lg-none btn btn-outline-secondary rounded-3"
              type="button"
              aria-label="Abrir menú"
              style={{
                height: "40px",
                padding: "0 12px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <svg
                className="text-dark"
                width="24"
                height="24"
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

            {/* Header completo - responsive */}
            <div className="navbar-collapse d-none d-lg-flex w-100 align-items-center justify-content-between">
              <div className="header-grid w-100">
                {/* Logo */}
                <div
                  className="navbar-brand d-flex align-items-center header-logo-wrap"
                  style={{
                    paddingRight: "0.5rem",
                    display: "flex",
                    alignItems: "center",
                    minWidth: "0",
                  }}
                >
                  <Link
                    to="/"
                    className="d-flex align-items-center logo-link"
                    style={{
                      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                      padding: "8px 12px",
                      borderRadius: "10px",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "scale(1.05)";
                      e.currentTarget.style.background = isDark
                        ? "rgba(59, 130, 246, 0.08)"
                        : "rgba(59, 130, 246, 0.05)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "scale(1)";
                      e.currentTarget.style.background = "transparent";
                    }}
                  >
                    <img
                      src="/Playlogo.png"
                      alt="Playcenter Universal"
                      className="img-fluid play-logo"
                      style={{
                        height: "44px",
                        width: "auto",
                        objectFit: "contain",
                        filter: "none", // eliminado drop-shadow/degradado en dark
                      }}
                    />
                  </Link>
                </div>

                {/* Buscador central — flexible */}
                <div
                  className="header-search"
                  style={{
                    minWidth: "160px",
                    maxWidth: "900px",
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    minHeight: "40px",
                    minWidth: "0",
                  }}
                >
                  <SearchBar
                    onClose={() => {}}
                    ref={buscarInputRef}
                    placeholder="Buscar en pcu.com.do"
                  />
                </div>

                {/* Acciones / links — puedes scrollear si no caben */}
                <div
                  className="header-actions"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "flex-end",
                    minWidth: "0",
                    gap: "0.5rem",
                  }}
                >
                  <nav className="navbar-nav d-flex flex-row align-items-center">
                    <div
                      className="d-flex align-items-center nav-links"
                      style={{
                        gap: "4px",
                        paddingLeft: "1rem",
                        display: "flex",
                        alignItems: "center",
                        overflowX: "auto",
                        WebkitOverflowScrolling: "touch",
                        minWidth: "0",
                        paddingBottom: "2px",
                      }}
                    >
                      <Link
                        to="/"
                        className="nav-link text-decoration-none rounded"
                        style={{
                          color: isDark ? "#f3f4f6" : "#374151",
                          fontSize: "13px",
                          padding: "6px 10px",
                          fontWeight: "500",
                          transition: "all 0.2s ease",
                        }}
                      >
                        Inicio
                      </Link>
                      <Link
                        to="/categorias"
                        className="nav-link text-decoration-none rounded"
                        style={{
                          color: isDark ? "#f3f4f6" : "#374151",
                          fontSize: "13px",
                          padding: "6px 10px",
                          fontWeight: "500",
                          transition: "all 0.2s ease",
                        }}
                      >
                        Categorías
                      </Link>
                      <Link
                        to="/tiendas"
                        className="nav-link text-decoration-none rounded"
                        style={{
                          color: isDark ? "#f3f4f6" : "#374151",
                          fontSize: "13px",
                          padding: "6px 10px",
                          fontWeight: "500",
                          transition: "all 0.2s ease",
                        }}
                      >
                        Tiendas
                      </Link>
                      <Link
                        to="/vender"
                        className="nav-link text-decoration-none rounded"
                        style={{
                          color: isDark ? "#f3f4f6" : "#374151",
                          fontSize: "13px",
                          padding: "6px 10px",
                          fontWeight: "500",
                          transition: "all 0.2s ease",
                        }}
                      >
                        Vender
                      </Link>
                      <Link
                        to="/nosotros"
                        className="nav-link text-decoration-none rounded"
                        style={{
                          color: isDark ? "#f3f4f6" : "#374151",
                          fontSize: "13px",
                          padding: "6px 10px",
                          fontWeight: "500",
                          transition: "all 0.2s ease",
                        }}
                      >
                        Nosotros
                      </Link>
                      <Link
                        to="/contacto"
                        className="nav-link text-decoration-none rounded"
                        style={{
                          color: isDark ? "#f3f4f6" : "#374151",
                          fontSize: "13px",
                          padding: "6px 10px",
                          fontWeight: "500",
                          transition: "all 0.2s ease",
                        }}
                      >
                        Contacto
                      </Link>
                      <Link
                        to="/estafetas"
                        className="nav-link text-decoration-none rounded"
                        style={{
                          color: isDark ? "#f3f4f6" : "#374151",
                          fontSize: "13px",
                          padding: "6px 10px",
                          fontWeight: "500",
                          transition: "all 0.2s ease",
                        }}
                      >
                        Estafetas
                      </Link>
                      <Link
                        to="/carrito"
                        className="nav-link text-decoration-none rounded d-flex align-items-center justify-content-center"
                        style={{
                          fontSize: "18px",
                          padding: "6px 10px",
                          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                        }}
                      >
                        🛒
                      </Link>
                    </div>
                    {(usuarioInfo?.isAdmin ||
                      usuarioInfo?.isSeller ||
                      usuarioInfo?.empresa ||
                      usuarioInfo?.empresaId) && (
                      <Link
                        to="/admin"
                        className="btn btn-sm ms-3"
                        style={{
                          fontSize: "12px",
                          padding: "6px 14px",
                          background:
                            "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
                          border: "none",
                          color: "#ffffff",
                          fontWeight: "600",
                          borderRadius: "8px",
                          boxShadow: isDark
                            ? "0 4px 12px rgba(59, 130, 246, 0.35)"
                            : "0 3px 10px rgba(59, 130, 246, 0.25)",
                          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                        }}
                      >
                        Admin
                      </Link>
                    )}
                    {usuario ? (
                      <motion.div
                        className="position-relative"
                        style={{ marginLeft: "12px" }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Link to="/profile" className="text-decoration-none">
                          <div
                            className="rounded-circle overflow-hidden d-flex align-items-center justify-content-center"
                            style={{
                              width: "40px",
                              height: "40px",
                              border: "2px solid rgba(59, 130, 246, 0.5)",
                              boxShadow: isDark
                                ? "0 0 16px rgba(59, 130, 246, 0.4), 0 4px 12px rgba(0, 0, 0, 0.3), inset 0 0 12px rgba(59, 130, 246, 0.15)"
                                : "0 4px 12px rgba(59, 130, 246, 0.25), 0 2px 8px rgba(0, 0, 0, 0.08), inset 0 0 12px rgba(59, 130, 246, 0.08)",
                              background: isDark ? "#1f2937" : "#ffffff",
                              transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                            }}
                          >
                            {usuario.photoURL ? (
                              <img
                                src={usuario.photoURL}
                                alt="Perfil"
                                className="w-100 h-100 rounded-circle"
                                style={{ objectFit: "cover" }}
                              />
                            ) : (
                              <div
                                className="w-100 h-100 d-flex align-items-center justify-content-center fw-bold rounded-circle"
                                style={{
                                  fontSize: "16px",
                                  background:
                                    "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
                                  color: "#ffffff",
                                }}
                              >
                                {usuario.displayName?.charAt(0).toUpperCase() ||
                                  "U"}
                              </div>
                            )}
                          </div>
                        </Link>
                      </motion.div>
                    ) : (
                      <motion.button
                        onClick={() => setModalAbierto(true)}
                        className="btn ms-3"
                        style={{
                          fontSize: "12px",
                          padding: "6px 16px",
                          background:
                            "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
                          border: "none",
                          color: "#ffffff",
                          fontWeight: "600",
                          borderRadius: "8px",
                          boxShadow: isDark
                            ? "0 4px 12px rgba(59, 130, 246, 0.35)"
                            : "0 3px 10px rgba(59, 130, 246, 0.25)",
                          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                        }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        Iniciar sesión
                      </motion.button>
                    )}
                  </nav>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.header>

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
              className="d-xl-none position-fixed top-0 start-0 w-100 h-100"
              style={{
                backgroundColor: isDark ? "#000000" : "#000000",
                zIndex: 99999,
              }}
            />

            {/* Menú drawer */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="d-xl-none position-fixed top-0 end-0 h-100 shadow-lg overflow-auto"
              style={{
                width: "320px",
                zIndex: 999999,
                backgroundColor: isDark ? "#111827" : "#ffffff",
              }}
            >
              {/* Header del menú */}
              <div className="d-flex align-items-center justify-content-between p-4 border-bottom">
                <h2
                  className="h4 fw-bold mb-0"
                  style={{ color: isDark ? "#f9fafb" : "#111827" }}
                >
                  Menú
                </h2>
                <button
                  onClick={() => setMenuOpen(false)}
                  className="btn p-2 rounded-3"
                  style={{
                    backgroundColor: isDark ? "#374151" : "#e5e7eb",
                    borderColor: isDark ? "#4b5563" : "#d1d5db",
                    color: isDark ? "#f9fafb" : "#111827",
                  }}
                  aria-label="Cerrar menú"
                >
                  <svg
                    width="24"
                    height="24"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    style={{ color: isDark ? "#f9fafb" : "#111827" }}
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
                <div className="p-4 border-bottom">
                  <Link
                    to="/profile"
                    onClick={() => setMenuOpen(false)}
                    className="d-flex align-items-center gap-3 p-3 text-decoration-none rounded-3 hover-primary"
                  >
                    <div
                      className="rounded-circle overflow-hidden border border-2 border-primary shadow"
                      style={{
                        width: "48px",
                        height: "48px",
                        backgroundColor: isDark ? "#374151" : "#ffffff",
                      }}
                    >
                      {usuario.photoURL ? (
                        <img
                          src={usuario.photoURL}
                          alt="Perfil"
                          className="w-100 h-100"
                          style={{ objectFit: "cover" }}
                        />
                      ) : (
                        <div
                          className="w-100 h-100 d-flex align-items-center justify-content-center fw-bold fs-5"
                          style={{
                            backgroundColor: isDark ? "#2563eb" : "#3b82f6",
                            color: "#ffffff",
                          }}
                        >
                          {usuario.displayName?.charAt(0).toUpperCase() || "U"}
                        </div>
                      )}
                    </div>
                    <div className="flex-grow-1">
                      <p
                        className="fw-semibold mb-1"
                        style={{ color: isDark ? "#f9fafb" : "#111827" }}
                      >
                        {usuario.displayName || "Usuario"}
                      </p>
                      <p
                        className="small mb-0"
                        style={{ color: isDark ? "#9ca3af" : "#6b7280" }}
                      >
                        Ver perfil
                      </p>
                    </div>
                    <svg
                      width="20"
                      height="20"
                      className="text-muted"
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
                <div className="p-4 border-bottom">
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      setModalAbierto(true);
                    }}
                    className="btn w-100 fw-semibold shadow d-flex align-items-center justify-content-center gap-2 py-3"
                    style={{
                      backgroundColor: isDark ? "#2563eb" : "#3b82f6",
                      borderColor: isDark ? "#2563eb" : "#3b82f6",
                      color: "#ffffff",
                    }}
                  >
                    <svg
                      width="20"
                      height="20"
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
                  className="d-flex align-items-center gap-3 px-4 py-3 text-decoration-none rounded-3 hover-primary fw-medium"
                  style={{ color: isDark ? "#f9fafb" : "#111827" }}
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