import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import SearchBar from "./SearchBar";
import { useAuth } from "../context/AuthContext";
import { useAuthModal } from "../context/AuthModalContext";
import { motion, AnimatePresence } from "framer-motion";
import { FaMapMarkerAlt } from "react-icons/fa";

const Header = () => {
  const [dropdownAbierto, setDropdownAbierto] = useState(false);
  const [showEnvios, setShowEnvios] = useState(true);
  const { usuario, logout } = useAuth();
  const { setModalAbierto } = useAuthModal();
  const dropdownRef = useRef(null);
  const buscarInputRef = useRef(null);
  const navigate = useNavigate();
  let lastScroll = 0;

  const manejarLogout = async () => {
    try {
      await logout();
      setDropdownAbierto(false);
      navigate("/");
    } catch (error) {
      console.error("Error cerrando sesión", error);
    }
  };

  useEffect(() => {
    function handleClickFuera(event) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        !event.target.closest("#search-bar-container")
      ) {
        setDropdownAbierto(false);
      }
    }
    document.addEventListener("mousedown", handleClickFuera);
    return () => document.removeEventListener("mousedown", handleClickFuera);
  }, []);

  useEffect(() => {
    if (buscarInputRef.current) {
      buscarInputRef.current.focus();
    }
  }, []);

  useEffect(() => {
    function handleScroll() {
      const currentScroll = window.pageYOffset;
      if (currentScroll > lastScroll) {
        setShowEnvios(false);
      } else {
        setShowEnvios(true);
      }
      lastScroll = currentScroll;
    }
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <motion.header
        initial={{ y: -120, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="fixed top-0 left-0 w-full bg-white shadow-md z-[9999] px-4 py-3"
        style={{
          backdropFilter: "saturate(180%) blur(15px)",
          maxWidth: "100vw",
          overflowX: "hidden",
        }}
      >
        <div className="flex items-center justify-between max-w-7xl mx-auto w-full gap-3">
          {/* Buscador solo móvil/tablet */}
          <div id="search-bar-container" className="flex-grow max-w-full px-2 lg:hidden">
            <SearchBar
              onClose={() => {}}
              ref={buscarInputRef}
              placeholder="Buscar en Playcenter.do"
            />
          </div>

          {/* Header completo solo desktop */}
          <div className="hidden lg:flex w-full items-center justify-between gap-6">
            <Link to="/" className="flex items-center gap-3 flex-shrink-0 group">
              <motion.img
                src="/Playlogo.png"
                alt="Playcenter Universal"
                className="h-10 object-contain rounded-xl shadow group-hover:ring-2 group-hover:ring-[#4FC3F7] transition"
                whileHover={{ scale: 1.07 }}
                transition={{ type: "spring", stiffness: 300 }}
              />
              <div className="flex flex-col leading-tight text-xs text-gray-700 font-medium">
                <span className="flex items-center gap-1 text-[11px] text-gray-500">
                  <FaMapMarkerAlt className="text-[#4FC3F7]" />
                  Envios
                </span>
                <strong className="text-[12px] font-semibold text-gray-700 uppercase tracking-wide">
                  EN TODO RD
                </strong>
              </div>
            </Link>

            <div className="flex-grow max-w-xl">
              <SearchBar
                onClose={() => {}}
                ref={buscarInputRef}
                placeholder="Buscar en Playcenter.do"
              />
            </div>

            <div className="flex items-center gap-6 text-sm font-medium text-gray-700">
              <Link to="/" className="nav-link hover:text-[#4FC3F7] transition">Inicio</Link>
              <Link to="/productos" className="nav-link hover:text-[#4FC3F7] transition">Categorías</Link>
              <Link to="/nosotros" className="nav-link hover:text-[#4FC3F7] transition">Nosotros</Link>
              <Link to="/contacto" className="nav-link hover:text-[#4FC3F7] transition">Contáctanos</Link>
              <Link to="/estafetas" className="nav-link hover:text-[#4FC3F7] transition">Estafetas</Link>
              <Link to="/carrito" className="nav-link text-xl hover:scale-110 transition">🛒</Link>

              {usuario?.uid === "ZeiFzBgosCd0apv9cXL6aQZCYyu2" && (
                <Link to="/admin" className="px-3 py-2 rounded bg-[#4FC3F7] text-white hover:bg-[#3BB0F3] shadow transition">
                  Panel Admin
                </Link>
              )}

              {usuario ? (
                <motion.div
                  className="relative"
                  ref={dropdownRef}
                  onClick={() => setDropdownAbierto(!dropdownAbierto)}
                  whileTap={{ scale: 0.95 }}
                >
                  <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-[#4FC3F7] shadow hover:shadow-lg transition cursor-pointer bg-white">
                    {usuario.photoURL ? (
                      <img
                        src={usuario.photoURL}
                        alt="Perfil"
                        className="w-full h-full object-cover rounded-full"
                      />
                    ) : (
                      <div className="w-full h-full bg-[#4FC3F7] text-white flex items-center justify-center font-bold text-base">
                        {usuario.displayName?.charAt(0).toUpperCase() || "U"}
                      </div>
                    )}
                  </div>
                  <AnimatePresence>
                    {dropdownAbierto && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-xl ring-1 ring-black ring-opacity-5 z-[10000]"
                      >
                        <Link
                          to="/profile"
                          className="block px-4 py-2 text-gray-700 hover:bg-[#4FC3F7] hover:text-white rounded-t-md transition"
                          onClick={() => setDropdownAbierto(false)}
                        >
                          Mi Perfil
                        </Link>
                        <button
                          onClick={manejarLogout}
                          className="w-full text-left px-4 py-2 text-gray-700 hover:bg-red-500 hover:text-white rounded-b-md transition"
                        >
                          Cerrar sesión
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ) : (
                <motion.button
                  onClick={() => setModalAbierto(true)}
                  className="px-4 py-2 text-sm bg-[#4FC3F7] hover:bg-[#3BB0F3] text-white rounded-lg font-semibold shadow transition"
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

      {showEnvios && (
        <div className="sm:hidden flex items-center justify-center gap-1 bg-[#E8F6FF] text-[#4FC3F7] py-1 text-[11px] font-semibold select-none fixed top-[58px] left-0 right-0 z-[9998] shadow">
          <FaMapMarkerAlt className="text-xs" />
          <span>Envíos a TODO RD</span>
        </div>
      )}

      {/* Botón admin en móvil, abajo derecha, arriba del navbar */}
      {usuario?.uid === "ZeiFzBgosCd0apv9cXL6aQZCYyu2" && (
        <div className="lg:hidden fixed bottom-[80px] right-4 z-[9999]">
          <Link
            to="/admin"
            className="bg-[#4FC3F7] hover:bg-[#3BB0F3] text-white px-5 py-3 rounded-full shadow-xl font-semibold text-base"
          >
            Panel Admin
          </Link>
        </div>
      )}

      {/* Espaciador debajo del header */}
      <div className="h-[100px] sm:h-[70px]" />
    </>
  );
};

export default Header;
