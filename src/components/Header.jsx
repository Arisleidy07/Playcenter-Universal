import React, { useState, useEffect, useRef } from "react";
import ReactDOM from "react-dom";
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
  const { usuario, usuarioInfo, logout, actualizarUsuarioInfo } = useAuth();
  const { setModalAbierto } = useAuthModal();
  const { isDark, toggleTheme } = useTheme();
  const buscarInputRef = useRef(null);
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const [modalEntrega, setModalEntrega] = useState(false);

  // Bloquear scroll del body cuando el menú está abierto
  useEffect(() => {
    if (menuOpen) {
      const scrollY = window.scrollY;
      document.body.style.position = "fixed";
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = "100%";
      document.body.style.overflow = "hidden";

      return () => {
        document.body.style.position = "";
        document.body.style.top = "";
        document.body.style.width = "";
        document.body.style.overflow = "";
        window.scrollTo(0, scrollY);
      };
    }
  }, [menuOpen]);

  const entregaSubtitle = (() => {
    try {
      if (!usuario || !usuarioInfo || !usuarioInfo.metodoEntrega) {
        return "Selecciona método de entrega";
      }
      const metodo = (usuarioInfo.metodoEntrega || "").toLowerCase();
      if (metodo === "tienda") return "Playcenter Universal";
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
      // Redirigir inmediatamente a inicio con replace para evitar volver atrás
      navigate("/", { replace: true });
    } catch (error) {
      // console.error("Error cerrando sesión", error);
      // Incluso si hay error, intentar ir al inicio
      navigate("/", { replace: true });
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

  return (
    <>
      {/* ESTRUCTURA DE 2 HEADERS COMO AMAZON */}
      <div>
        {/* 1. HEADER PRINCIPAL (GRANDE) - ARRIBA DEL TODO */}
        <header
          className="navbar navbar-expand-xl"
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
              ? "0 4px 32px rgba(0, 0, 0, 0.5), 0 0 48px rgba(59, 130, 246, 0.08)"
              : "0 2px 24px rgba(0, 0, 0, 0.08), 0 0 48px rgba(59, 130, 246, 0.05)",
            paddingLeft: "0",
            paddingRight: "0",
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
                  className="hamburger-icon"
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
                  {/* Logo + Método de Entrega */}
                  <div
                    className="d-flex align-items-center gap-2"
                    style={{
                      paddingLeft: "0.5rem",
                      minWidth: "0",
                    }}
                  >
                    <Link
                      to="/"
                      className="d-flex align-items-center"
                      style={{
                        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                        padding: "0",
                      }}
                    >
                      <img
                        src="/Playlogo.png"
                        alt="Playcenter Universal"
                        className="img-fluid"
                        style={{
                          height: "36px",
                          width: "auto",
                          objectFit: "contain",
                        }}
                      />
                    </Link>

                    {/* Método de entrega al lado del logo - SIEMPRE VISIBLE */}
                    <button
                      onClick={() => {
                        if (!usuario) {
                          alert(
                            "Debes iniciar sesión para seleccionar un método de entrega"
                          );
                          setModalAbierto(true);
                        } else {
                          setModalEntrega(true);
                        }
                      }}
                      className="btn btn-sm delivery-btn d-flex align-items-center gap-1"
                      style={{
                        whiteSpace: "nowrap",
                      }}
                    >
                      <FaMapMarkerAlt size={10} className="delivery-icon" />
                      <div style={{ textAlign: "left", lineHeight: "1.1" }}>
                        <div style={{ fontSize: "9px", opacity: 0.7 }}>
                          Enviar a
                        </div>
                        <div style={{ fontSize: "10px", fontWeight: "600" }}>
                          {entregaSubtitle.length > 15
                            ? entregaSubtitle.substring(0, 15) + "..."
                            : entregaSubtitle}
                        </div>
                      </div>
                    </button>
                  </div>

                  {/* Buscador central - GIGANTE */}
                  <div
                    className="header-search"
                    style={{
                      maxWidth: "1600px",
                      width: "100%",
                      flex: "1 1 auto",
                      display: "flex",
                      alignItems: "center",
                      minHeight: "42px",
                      overflow: "visible",
                    }}
                  >
                    <SearchBar
                      onClose={() => {}}
                      ref={buscarInputRef}
                      placeholder="Buscar en pcu.com.do"
                    />
                  </div>

                  {/* Acciones - Solo Carrito y Perfil */}
                  <div
                    className="header-actions"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "flex-end",
                      minWidth: "0",
                      gap: "0.75rem",
                      paddingRight: "0.5rem",
                    }}
                  >
                    <nav className="navbar-nav d-flex flex-row align-items-center gap-2">
                      {/* Carrito con ícono SVG */}
                      <Link
                        to="/carrito"
                        className="text-decoration-none d-flex align-items-center justify-content-center"
                        style={{
                          padding: "6px",
                          transition: "all 0.15s ease",
                        }}
                      >
                        <svg
                          width="24"
                          height="24"
                          fill="none"
                          className="cart-icon"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                          />
                        </svg>
                      </Link>

                      {/* Admin si aplica */}
                      {(usuarioInfo?.isAdmin ||
                        usuarioInfo?.isSeller ||
                        usuarioInfo?.empresa ||
                        usuarioInfo?.empresaId) && (
                        <Link
                          to="/admin"
                          className="btn btn-sm"
                          style={{
                            fontSize: "10px",
                            padding: "4px 10px",
                            background:
                              "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
                            border: "none",
                            color: "#ffffff",
                            fontWeight: "600",
                            borderRadius: "5px",
                            marginLeft: "4px",
                            boxShadow: "0 2px 8px rgba(59, 130, 246, 0.2)",
                            transition: "all 0.2s ease",
                          }}
                        >
                          Admin
                        </Link>
                      )}
                      {usuario ? (
                        <motion.div
                          className="position-relative"
                          style={{ marginLeft: "4px" }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Link to="/profile" className="text-decoration-none">
                            <div
                              className="rounded-circle overflow-hidden d-flex align-items-center justify-content-center"
                              style={{
                                width: "36px",
                                height: "36px",
                                border: "2px solid rgba(59, 130, 246, 0.4)",
                                boxShadow: "0 2px 8px rgba(59, 130, 246, 0.2)",
                                background: isDark ? "#1f2937" : "#ffffff",
                                transition: "all 0.2s ease",
                                overflow: "hidden",
                              }}
                            >
                              {usuarioInfo?.fotoURL || usuario.photoURL ? (
                                <img
                                  src={usuarioInfo?.fotoURL || usuario.photoURL}
                                  alt="Perfil"
                                  className="w-100 h-100"
                                  style={{ objectFit: "cover" }}
                                />
                              ) : (
                                <div
                                  className="w-100 h-100 d-flex align-items-center justify-content-center fw-bold"
                                  style={{
                                    fontSize: "14px",
                                    background:
                                      "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
                                    color: "#ffffff",
                                  }}
                                >
                                  {usuario.displayName
                                    ?.charAt(0)
                                    .toUpperCase() || "U"}
                                </div>
                              )}
                            </div>
                          </Link>
                        </motion.div>
                      ) : (
                        <motion.button
                          onClick={() => setModalAbierto(true)}
                          className="btn"
                          style={{
                            fontSize: "10px",
                            padding: "4px 10px",
                            background:
                              "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
                            border: "none",
                            color: "#ffffff",
                            fontWeight: "600",
                            borderRadius: "5px",
                            marginLeft: "4px",
                            boxShadow: "0 2px 8px rgba(59, 130, 246, 0.2)",
                            transition: "all 0.2s ease",
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
        </header>

        {/* 2. SEGUNDO HEADER (BARRA DE NAVEGACIÓN PREMIUM CON ICONOS + TEMA) */}
        <div
          className="d-none d-lg-block"
          style={{
            background: isDark
              ? "linear-gradient(135deg, rgba(31, 41, 55, 0.98) 0%, rgba(17, 24, 39, 0.98) 100%)"
              : "linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(249, 250, 251, 0.98) 100%)",
            backdropFilter: "blur(20px) saturate(180%)",
            WebkitBackdropFilter: "blur(20px) saturate(180%)",
            borderBottom: isDark
              ? "1px solid rgba(59, 130, 246, 0.15)"
              : "1px solid rgba(59, 130, 246, 0.12)",
            padding: "0.75rem 0",
            boxShadow: isDark
              ? "0 4px 16px rgba(0, 0, 0, 0.4), 0 0 32px rgba(59, 130, 246, 0.08)"
              : "0 2px 12px rgba(0, 0, 0, 0.08), 0 0 32px rgba(59, 130, 246, 0.05)",
            overflowX: "auto",
            overflowY: "hidden",
          }}
        >
          <div className="container-fluid" style={{ minWidth: "max-content" }}>
            <div
              className="d-flex align-items-center justify-content-between"
              style={{
                paddingLeft: "1rem",
                paddingRight: "1rem",
                minWidth: "max-content",
              }}
            >
              {/* Navegación con iconos GRANDES y separadores */}
              <nav
                className="d-flex align-items-center"
                style={{ gap: "0.5rem" }}
              >
                <Link
                  to="/"
                  className="text-decoration-none d-flex align-items-center gap-2"
                  style={{
                    color: isDark ? "#e5e7eb" : "#374151",
                    fontSize: "14px",
                    fontWeight: "600",
                    padding: "0.5rem 1rem",
                    borderRadius: "6px",
                    transition: "all 0.2s ease",
                    background: "transparent",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = isDark
                      ? "rgba(59, 130, 246, 0.15)"
                      : "rgba(59, 130, 246, 0.1)";
                    e.currentTarget.style.color = "#3b82f6";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "transparent";
                    e.currentTarget.style.color = isDark
                      ? "#e5e7eb"
                      : "#374151";
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
                      d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                    />
                  </svg>
                  Inicio
                </Link>

                <div
                  style={{
                    width: "1px",
                    height: "24px",
                    background: isDark
                      ? "rgba(255,255,255,0.1)"
                      : "rgba(0,0,0,0.1)",
                  }}
                ></div>

                <Link
                  to="/categorias"
                  className="text-decoration-none d-flex align-items-center gap-2"
                  style={{
                    color: isDark ? "#e5e7eb" : "#374151",
                    fontSize: "14px",
                    fontWeight: "600",
                    padding: "0.5rem 1rem",
                    borderRadius: "6px",
                    transition: "all 0.2s ease",
                    background: "transparent",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = isDark
                      ? "rgba(59, 130, 246, 0.15)"
                      : "rgba(59, 130, 246, 0.1)";
                    e.currentTarget.style.color = "#3b82f6";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "transparent";
                    e.currentTarget.style.color = isDark
                      ? "#e5e7eb"
                      : "#374151";
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
                      d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                    />
                  </svg>
                  Categorías
                </Link>

                <div
                  style={{
                    width: "1px",
                    height: "24px",
                    background: isDark
                      ? "rgba(255,255,255,0.1)"
                      : "rgba(0,0,0,0.1)",
                  }}
                ></div>

                <Link
                  to="/tiendas"
                  className="text-decoration-none d-flex align-items-center gap-2"
                  style={{
                    color: isDark ? "#e5e7eb" : "#374151",
                    fontSize: "14px",
                    fontWeight: "600",
                    padding: "0.5rem 1rem",
                    borderRadius: "6px",
                    transition: "all 0.2s ease",
                    background: "transparent",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = isDark
                      ? "rgba(59, 130, 246, 0.15)"
                      : "rgba(59, 130, 246, 0.1)";
                    e.currentTarget.style.color = "#3b82f6";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "transparent";
                    e.currentTarget.style.color = isDark
                      ? "#e5e7eb"
                      : "#374151";
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
                      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                    />
                  </svg>
                  Tiendas
                </Link>

                <div
                  style={{
                    width: "1px",
                    height: "24px",
                    background: isDark
                      ? "rgba(255,255,255,0.1)"
                      : "rgba(0,0,0,0.1)",
                  }}
                ></div>

                <Link
                  to="/vender"
                  className="text-decoration-none d-flex align-items-center gap-2"
                  style={{
                    color: isDark ? "#e5e7eb" : "#374151",
                    fontSize: "14px",
                    fontWeight: "600",
                    padding: "0.5rem 1rem",
                    borderRadius: "6px",
                    transition: "all 0.2s ease",
                    background: "transparent",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = isDark
                      ? "rgba(59, 130, 246, 0.15)"
                      : "rgba(59, 130, 246, 0.1)";
                    e.currentTarget.style.color = "#3b82f6";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "transparent";
                    e.currentTarget.style.color = isDark
                      ? "#e5e7eb"
                      : "#374151";
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
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  Vender
                </Link>

                <div
                  style={{
                    width: "1px",
                    height: "24px",
                    background: isDark
                      ? "rgba(255,255,255,0.1)"
                      : "rgba(0,0,0,0.1)",
                  }}
                ></div>

                <Link
                  to="/nosotros"
                  className="text-decoration-none d-flex align-items-center gap-2"
                  style={{
                    color: isDark ? "#e5e7eb" : "#374151",
                    fontSize: "14px",
                    fontWeight: "600",
                    padding: "0.5rem 1rem",
                    borderRadius: "6px",
                    transition: "all 0.2s ease",
                    background: "transparent",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = isDark
                      ? "rgba(59, 130, 246, 0.15)"
                      : "rgba(59, 130, 246, 0.1)";
                    e.currentTarget.style.color = "#3b82f6";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "transparent";
                    e.currentTarget.style.color = isDark
                      ? "#e5e7eb"
                      : "#374151";
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
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  Nosotros
                </Link>

                <div
                  style={{
                    width: "1px",
                    height: "24px",
                    background: isDark
                      ? "rgba(255,255,255,0.1)"
                      : "rgba(0,0,0,0.1)",
                  }}
                ></div>

                <Link
                  to="/contacto"
                  className="text-decoration-none d-flex align-items-center gap-2"
                  style={{
                    color: isDark ? "#e5e7eb" : "#374151",
                    fontSize: "14px",
                    fontWeight: "600",
                    padding: "0.5rem 1rem",
                    borderRadius: "6px",
                    transition: "all 0.2s ease",
                    background: "transparent",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = isDark
                      ? "rgba(59, 130, 246, 0.15)"
                      : "rgba(59, 130, 246, 0.1)";
                    e.currentTarget.style.color = "#3b82f6";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "transparent";
                    e.currentTarget.style.color = isDark
                      ? "#e5e7eb"
                      : "#374151";
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
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                  Contacto
                </Link>

                <div
                  style={{
                    width: "1px",
                    height: "24px",
                    background: isDark
                      ? "rgba(255,255,255,0.1)"
                      : "rgba(0,0,0,0.1)",
                  }}
                ></div>

                <Link
                  to="/carrito"
                  className="text-decoration-none d-flex align-items-center gap-2 cart-link"
                  style={{
                    fontSize: "14px",
                    fontWeight: "600",
                    padding: "0.5rem 1rem",
                    borderRadius: "6px",
                  }}
                >
                  <svg
                    width="20"
                    height="20"
                    fill="none"
                    className="cart-icon"
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

                <div
                  style={{
                    width: "1px",
                    height: "24px",
                    background: isDark
                      ? "rgba(255,255,255,0.1)"
                      : "rgba(0,0,0,0.1)",
                  }}
                ></div>

                <Link
                  to="/estafetas"
                  className="text-decoration-none d-flex align-items-center gap-2"
                  style={{
                    color: isDark ? "#e5e7eb" : "#374151",
                    fontSize: "14px",
                    fontWeight: "600",
                    padding: "0.5rem 1rem",
                    borderRadius: "6px",
                    transition: "all 0.2s ease",
                    background: "transparent",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = isDark
                      ? "rgba(59, 130, 246, 0.15)"
                      : "rgba(59, 130, 246, 0.1)";
                    e.currentTarget.style.color = "#3b82f6";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "transparent";
                    e.currentTarget.style.color = isDark
                      ? "#e5e7eb"
                      : "#374151";
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
              </nav>

              {/* Botón de cambio de tema (Luna/Sol) */}
              <button
                onClick={toggleTheme}
                className="d-flex align-items-center justify-content-center"
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "50%",
                  border: "none",
                  background: isDark
                    ? "rgba(59, 130, 246, 0.15)"
                    : "rgba(59, 130, 246, 0.1)",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
                aria-label="Cambiar tema"
              >
                {isDark ? (
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#60a5fa"
                    strokeWidth="2"
                  >
                    <circle cx="12" cy="12" r="5"></circle>
                    <line x1="12" y1="1" x2="12" y2="3"></line>
                    <line x1="12" y1="21" x2="12" y2="23"></line>
                    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                    <line x1="1" y1="12" x2="3" y2="12"></line>
                    <line x1="21" y1="12" x2="23" y2="12"></line>
                    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
                  </svg>
                ) : (
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="#3b82f6"
                  >
                    <path d="m12.3 4.9c.4-.2.6-.7.5-1.1s-.6-.8-1.1-.8c-4.9.1-8.7 4.1-8.7 9 0 5 4 9 9 9 3.8 0 7.1-2.4 8.4-5.9.2-.4 0-.9-.4-1.2s-.9-.2-1.2.1c-1 .9-2.3 1.4-3.7 1.4-3.1 0-5.7-2.5-5.7-5.7 0-1.9 1.1-3.8 2.9-4.8zm2.8 12.5c.5 0 1 0 1.4-.1-1.2 1.1-2.8 1.7-4.5 1.7-3.9 0-7-3.1-7-7 0-2.5 1.4-4.8 3.5-6-.7 1.1-1 2.4-1 3.8-.1 4.2 3.4 7.6 7.6 7.6z"></path>
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de entrega (desde header) */}
      {modalEntrega && (
        <Entrega
          abierto={modalEntrega}
          onClose={() => setModalEntrega(false)}
          usuarioId={usuarioInfo?.uid || usuario?.uid}
          actualizarUsuarioInfo={actualizarUsuarioInfo}
          direccionEditar={null}
          actualizarLista={() => {}}
        />
      )}

      {/* Menú lateral móvil/tablet - Renderizado en body con Portal */}
      {ReactDOM.createPortal(
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
                  backgroundColor: isDark
                    ? "rgba(0, 0, 0, 0.7)"
                    : "rgba(0, 0, 0, 0.7)",
                  zIndex: 99999998,
                  backdropFilter: "blur(4px)",
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
                  width: "min(320px, 85vw)",
                  maxWidth: "100vw",
                  zIndex: 99999999,
                  backgroundColor: isDark ? "#111827" : "#ffffff",
                  overscrollBehavior: "contain",
                  WebkitOverflowScrolling: "touch",
                }}
              >
                {/* Header del menú */}
                <div className="d-flex align-items-center justify-content-between p-4 border-bottom">
                  <h2 className="h4 fw-bold mb-0" style={{ color: "#2563eb" }}>
                    Menú
                  </h2>
                  <button
                    onClick={() => setMenuOpen(false)}
                    className="btn"
                    style={{
                      backgroundColor: "#2563eb",
                      border: "none",
                      color: "#ffffff",
                      width: "40px",
                      height: "40px",
                      minWidth: "40px",
                      minHeight: "40px",
                      maxWidth: "40px",
                      maxHeight: "40px",
                      borderRadius: "10px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: "0",
                      flexShrink: 0,
                    }}
                    aria-label="Cerrar menú"
                  >
                    <svg
                      width="24"
                      height="24"
                      fill="none"
                      stroke="#ffffff"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2.5}
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
                          width: "56px",
                          height: "56px",
                          minWidth: "56px",
                          minHeight: "56px",
                          backgroundColor: isDark ? "#374151" : "#ffffff",
                        }}
                      >
                        {usuarioInfo?.fotoURL || usuario.photoURL ? (
                          <img
                            src={usuarioInfo?.fotoURL || usuario.photoURL}
                            alt="Perfil"
                            className="w-100 h-100"
                            style={{ objectFit: "contain" }}
                          />
                        ) : (
                          <div
                            className="w-100 h-100 d-flex align-items-center justify-content-center fw-bold fs-5"
                            style={{
                              backgroundColor: isDark ? "#2563eb" : "#3b82f6",
                              color: "#ffffff",
                            }}
                          >
                            {usuario.displayName?.charAt(0).toUpperCase() ||
                              "U"}
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
                      className="btn w-100 fw-semibold d-flex align-items-center justify-content-center gap-2"
                      style={{
                        backgroundColor: "#2563eb",
                        border: "none",
                        color: "#ffffff",
                        borderRadius: "10px",
                        padding: "14px 24px",
                        fontSize: "16px",
                        fontWeight: "600",
                        boxShadow: "0 4px 12px rgba(37, 99, 235, 0.4)",
                        minHeight: "50px",
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
                        d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                      />
                    </svg>
                    Categorías
                  </Link>

                  <Link
                    to="/tiendas"
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
                        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                      />
                    </svg>
                    Tiendas
                  </Link>

                  <Link
                    to="/vender"
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
                        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    Vender
                  </Link>

                  <Link
                    to="/nosotros"
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
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    Nosotros
                  </Link>

                  <Link
                    to="/contacto"
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
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                    Contáctanos
                  </Link>

                  <Link
                    to="/estafetas"
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
                        d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    </svg>
                    Carrito
                  </Link>

                  {/* Método de entrega - Estilizado justo debajo del carrito */}
                  <div className="px-2 py-2">
                    <button
                      onClick={() => {
                        if (!usuario) {
                          setMenuOpen(false);
                          alert(
                            "Debes iniciar sesión para seleccionar un método de entrega"
                          );
                          setModalAbierto(true);
                        } else {
                          setMenuOpen(false);
                          setModalEntrega(true);
                        }
                      }}
                      className="w-100 d-flex align-items-center gap-3 px-3 py-3 rounded-3 border-0 text-start"
                      style={{
                        background: isDark
                          ? "linear-gradient(135deg, rgba(59, 130, 246, 0.15), rgba(37, 99, 235, 0.15))"
                          : "linear-gradient(135deg, rgba(59, 130, 246, 0.08), rgba(37, 99, 235, 0.08))",
                        border: isDark
                          ? "1px solid rgba(59, 130, 246, 0.3)"
                          : "1px solid rgba(59, 130, 246, 0.2)",
                        transition: "all 0.2s ease",
                        cursor: "pointer",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = isDark
                          ? "linear-gradient(135deg, rgba(59, 130, 246, 0.25), rgba(37, 99, 235, 0.25))"
                          : "linear-gradient(135deg, rgba(59, 130, 246, 0.12), rgba(37, 99, 235, 0.12))";
                        e.currentTarget.style.transform = "translateY(-2px)";
                        e.currentTarget.style.boxShadow = isDark
                          ? "0 4px 12px rgba(59, 130, 246, 0.3)"
                          : "0 4px 12px rgba(59, 130, 246, 0.2)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = isDark
                          ? "linear-gradient(135deg, rgba(59, 130, 246, 0.15), rgba(37, 99, 235, 0.15))"
                          : "linear-gradient(135deg, rgba(59, 130, 246, 0.08), rgba(37, 99, 235, 0.08))";
                        e.currentTarget.style.transform = "translateY(0)";
                        e.currentTarget.style.boxShadow = "none";
                      }}
                    >
                      <div
                        className="d-flex align-items-center justify-content-center rounded-circle"
                        style={{
                          width: "40px",
                          height: "40px",
                          minWidth: "40px",
                          background: isDark
                            ? "linear-gradient(135deg, #3b82f6, #2563eb)"
                            : "linear-gradient(135deg, #60a5fa, #3b82f6)",
                          boxShadow: "0 2px 8px rgba(59, 130, 246, 0.3)",
                        }}
                      >
                        <FaMapMarkerAlt size={18} color="#ffffff" />
                      </div>
                      <div className="d-flex flex-column flex-grow-1">
                        <span
                          className="fw-bold"
                          style={{
                            color: isDark ? "#f9fafb" : "#111827",
                            fontSize: "14px",
                            marginBottom: "2px",
                          }}
                        >
                          Método de entrega
                        </span>
                        <span
                          className="small"
                          style={{
                            color: isDark ? "#9ca3af" : "#6b7280",
                            fontSize: "12px",
                            lineHeight: "1.3",
                          }}
                        >
                          {entregaSubtitle.length > 35
                            ? entregaSubtitle.substring(0, 35) + "..."
                            : entregaSubtitle}
                        </span>
                      </div>
                      <svg
                        width="20"
                        height="20"
                        fill="none"
                        stroke={isDark ? "#60a5fa" : "#3b82f6"}
                        viewBox="0 0 24 24"
                        style={{ minWidth: "20px" }}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </button>
                  </div>

                  {/* Panel Admin si aplica */}
                  {(usuarioInfo?.isAdmin ||
                    usuarioInfo?.isSeller ||
                    usuarioInfo?.empresa ||
                    usuarioInfo?.empresaId) && (
                    <Link
                      to="/admin"
                      onClick={() => setMenuOpen(false)}
                      className="d-flex align-items-center gap-3 px-4 py-3 text-decoration-none rounded-3 hover-primary fw-medium mt-2"
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
        </AnimatePresence>,
        document.body
      )}
    </>
  );
};

export default Header;
