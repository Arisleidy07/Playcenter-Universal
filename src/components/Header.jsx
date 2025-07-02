import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import SearchBar from "./SearchBar";
import SidebarMenu from "./SidebarMenu";
import { useAuth } from "../context/AuthContext";
import { useAuthModal } from "../context/AuthModalContext";
import { motion, AnimatePresence } from "framer-motion";
import MarioCoinBlock from "./MarioCoinBlock";
import { FaMapMarkerAlt, FaSearch } from "react-icons/fa";

function Header() {
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [dropdownAbierto, setDropdownAbierto] = useState(false);
  const [buscadorVisible, setBuscadorVisible] = useState(false);
  const { usuario, logout } = useAuth();
  const { modalAbierto, setModalAbierto } = useAuthModal();
  const dropdownRef = useRef(null);
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

  return (
    <>
      <motion.header
        initial={{ y: -120, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="fixed top-0 left-0 w-full bg-white shadow-md z-[9999] px-6 py-3"
        style={{ backdropFilter: "saturate(180%) blur(15px)", maxWidth: "100vw", overflowX: "hidden" }}
      >
        <div className="flex items-center justify-between max-w-7xl mx-auto w-full gap-4 sm:gap-6">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 flex-shrink-0">
            <motion.img
              src="/playcenter.jpeg"
              alt="Playcenter Universal"
              className="h-10 object-contain"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
            />
            <div className="flex flex-col leading-tight text-xs text-gray-700 font-medium hidden sm:flex">
              <span className="flex items-center gap-1 text-[11px] text-gray-500">
                <FaMapMarkerAlt className="text-[#4FC3F7]" />
                Envios
              </span>
              <strong className="text-[12px] font-semibold text-gray-700 uppercase tracking-wide">
                EN TODO RD
              </strong>
            </div>
          </Link>

          {/* BUSCADOR MOBILE: Solo lupa que abre SearchBar */}
          <div className="sm:hidden relative" id="search-bar-container">
            {!buscadorVisible && (
              <button
                onClick={() => setBuscadorVisible(true)}
                aria-label="Abrir búsqueda"
                className="text-gray-600 hover:text-[#4FC3F7] transition text-xl"
              >
                <FaSearch />
              </button>
            )}

            <AnimatePresence>
              {buscadorVisible && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="absolute top-10 left-0 w-screen max-w-xs bg-white rounded shadow-lg p-2 z-50"
                >
                  <SearchBar onClose={() => setBuscadorVisible(false)} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Navegación y login/perfil desktop */}
          <div className="hidden sm:flex items-center gap-6">

            {/* SearchBar desktop */}
            <div className="flex-grow max-w-[240px]">
              <SearchBar />
            </div>

            <nav className="flex gap-6 items-center text-sm font-medium text-gray-700">
              <MarioCoinBlock />
              <Link to="/" className="nav-link">
                Inicio
              </Link>
              <Link to="/productos" className="nav-link">
                Categorías
              </Link>
              <Link to="/arcade" className="nav-link">
                Arcade
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
            </nav>

            {usuario ? (
              <motion.div
                className="relative"
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
                className="px-4 py-2 text-sm bg-[#4FC3F7] hover:bg-[#3BB0F3] text-white rounded-lg font-semibold shadow transition"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Iniciar sesión
              </motion.button>
            )}
          </div>
        </div>
      </motion.header>

      <SidebarMenu isOpen={menuAbierto} onClose={() => setMenuAbierto(false)} />

      {/* Espacio para que el contenido no quede debajo del header */}
      <div className="h-[70px] sm:h-[110px]" />
    </>
  );
}

export default Header;
