import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import SearchBar from "./SearchBar";
import { useAuth } from "../context/AuthContext";
import { useAuthModal } from "../context/AuthModalContext";
import { motion, AnimatePresence } from "framer-motion";
import { FaMapMarkerAlt, FaSearch, FaTimes } from "react-icons/fa";

const Header = () => {
  const [dropdownAbierto, setDropdownAbierto] = useState(false);
  const [buscadorVisible, setBuscadorVisible] = useState(false);
  const { usuario, logout } = useAuth();
  const { setModalAbierto } = useAuthModal();
  const dropdownRef = useRef(null);
  const buscarInputRef = useRef(null);
  const navigate = useNavigate();

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
        buscadorVisible &&
        !event.target.closest("#search-bar-container")
      ) {
        setDropdownAbierto(false);
        setBuscadorVisible(false);
      }
    }
    if (dropdownAbierto || buscadorVisible) {
      document.addEventListener("mousedown", handleClickFuera);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickFuera);
    };
  }, [dropdownAbierto, buscadorVisible]);

  useEffect(() => {
    if (buscadorVisible && buscarInputRef.current) {
      buscarInputRef.current.focus();
    }
  }, [buscadorVisible]);

  return (
    <>
      {/* HEADER PRINCIPAL */}
      <motion.header
        initial={{ y: -120, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="fixed top-0 left-0 w-full bg-white shadow-md z-[9999] px-4 sm:px-6 py-3"
        style={{
          backdropFilter: "saturate(180%) blur(15px)",
          maxWidth: "100vw",
          overflowX: "hidden",
        }}
      >
        <div className="flex items-center justify-between max-w-7xl mx-auto w-full gap-3 sm:gap-6">
          {/* Logo solo visible en sm+ */}
          <Link to="/" className="hidden sm:flex items-center gap-3 flex-shrink-0">
            <motion.img
              src="/playcenter.jpeg"
              alt="Playcenter Universal"
              className="h-10 sm:h-12 object-contain"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
            />
            <div className="hidden sm:flex flex-col leading-tight text-xs text-gray-700 font-medium">
              <span className="flex items-center gap-1 text-[11px] text-gray-500">
                <FaMapMarkerAlt className="text-[#4FC3F7]" />
                Envios
              </span>
              <strong className="text-[12px] font-semibold text-gray-700 uppercase tracking-wide">
                EN TODO RD
              </strong>
            </div>
          </Link>

          {/* SEARCH BAR desktop */}
          <div className="hidden sm:flex flex-grow max-w-xl">
            <SearchBar
              onClose={() => setBuscadorVisible(false)}
              ref={buscarInputRef}
              placeholder="Buscar en Playcenter.do"
            />
          </div>

          {/* BOTÓN BUSCADOR MOBILE */}
          <div className="sm:hidden relative" id="search-bar-container">
            <button
              onClick={() => setBuscadorVisible((v) => !v)}
              aria-label={buscadorVisible ? "Cerrar búsqueda" : "Abrir búsqueda"}
              className="text-gray-600 hover:text-[#4FC3F7] transition text-xl flex items-center justify-center w-10 h-10 rounded-full bg-white shadow-md"
            >
              {buscadorVisible ? <FaTimes /> : <FaSearch />}
            </button>
          </div>

          {/* NAV DESKTOP */}
          <div className="hidden sm:flex items-center gap-6 text-sm font-medium text-gray-700">
            <Link to="/" className="nav-link">
              Inicio
            </Link>
            <Link to="/productos" className="nav-link">
              Categorías
            </Link>
            <Link to="/nosotros" className="nav-link">
              Nosotros
            </Link>
            <Link to="/contacto" className="nav-link">
              Contáctanos
            </Link>
            <Link to="/carrito" className="nav-link text-xl hover:scale-110">
              🛒
            </Link>
          </div>

          {/* USUARIO / LOGIN */}
          {usuario ? (
            <motion.div
              className="relative hidden sm:block"
              ref={dropdownRef}
              onClick={() => setDropdownAbierto(!dropdownAbierto)}
              whileTap={{ scale: 0.95 }}
            >
              <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-[#4FC3F7] shadow hover:shadow-lg transition cursor-pointer">
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
                    className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-50"
                  >
                    <Link
                      to="/profile"
                      className="block px-4 py-2 text-gray-700 hover:bg-[#4FC3F7] hover:text-white rounded-t-md"
                      onClick={() => setDropdownAbierto(false)}
                    >
                      Mi Perfil
                    </Link>
                    <button
                      onClick={manejarLogout}
                      className="w-full text-left px-4 py-2 text-gray-700 hover:bg-red-500 hover:text-white rounded-b-md"
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
              className="hidden sm:inline-block px-4 py-2 text-sm bg-[#4FC3F7] hover:bg-[#3BB0F3] text-white rounded-lg font-semibold shadow transition"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Iniciar sesión
            </motion.button>
          )}
        </div>
      </motion.header>

      {/* BUSCADOR MOBILE GRANDE (sin logo) */}
      <AnimatePresence>
        {buscadorVisible && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="fixed top-0 left-0 w-full z-[99999] bg-white p-4 shadow-md"
          >
            <SearchBar
              onClose={() => setBuscadorVisible(false)}
              ref={buscarInputRef}
              placeholder="Buscar en Playcenter.do"
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ESPACIO PARA EL HEADER FIJO */}
      <div className="h-[70px] sm:h-[110px]" />
    </>
  );
};

export default Header;