import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import SearchBar from "./SearchBar";
import SidebarMenu from "./SidebarMenu";
import { useAuth } from "../context/AuthContext";
import AuthModal from "./AuthModal";
import { motion, AnimatePresence } from "framer-motion";
import MarioCoinBlock from "./MarioCoinBlock";
import { FaMapMarkerAlt } from "react-icons/fa";

function Header() {
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [dropdownAbierto, setDropdownAbierto] = useState(false);
  const { usuario, logout, login, signup } = useAuth();
  const dropdownRef = useRef(null);

  const manejarLogout = async () => {
    try {
      await logout();
      setDropdownAbierto(false);
    } catch (error) {
      console.error("Error cerrando sesión", error);
    }
  };

  const handleLogin = async (email, password) => {
    try {
      await login(email, password);
      setModalAbierto(false);
    } catch (error) {
      console.error("Error al iniciar sesión:", error);
      alert("Correo o contraseña incorrectos.");
    }
  };

  const handleSignup = async (email, password, name) => {
    try {
      await signup(email, password, name);
      setModalAbierto(false);
    } catch (error) {
      console.error("Error al registrarse:", error);
      alert("Error al crear la cuenta.");
    }
  };

  useEffect(() => {
    function handleClickFuera(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownAbierto(false);
      }
    }

    if (dropdownAbierto) {
      document.addEventListener("mousedown", handleClickFuera);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickFuera);
    };
  }, [dropdownAbierto]);

  return (
    <>
      <motion.header
        initial={{ y: -120, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="fixed top-0 left-0 w-full bg-white shadow-md z-[9999] px-4 sm:px-6 md:px-8 py-3"
        style={{ backdropFilter: "saturate(180%) blur(15px)" }}
      >
        {/* WRAPPER FLEX */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

          {/* IZQUIERDA: LOGO + UBICACIÓN */}
          <div className="flex items-center gap-4 flex-shrink-0">
            <Link to="/" className="flex items-center gap-3">
              <motion.img
                src="/playcenter.jpeg"
                alt="Playcenter Universal"
                className="h-9 sm:h-12 md:h-14 object-contain"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
              />
              <div className="hidden sm:flex flex-col leading-tight text-sm text-gray-800 font-medium">
                <span className="flex items-center gap-1 text-xs text-gray-600">
                  <FaMapMarkerAlt className="text-[#4FC3F7]" />
                  Envios
                </span>
                <strong className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                  EN TODO RD
                </strong>
              </div>
            </Link>
          </div>

          {/* CENTRO: SEARCHBAR */}
          <div className="w-full sm:max-w-md">
            <SearchBar />
          </div>

          {/* DERECHA: BOTÓN MENÚ (solo en móvil) */}
          <motion.button
            className="sm:hidden text-2xl self-end"
            onClick={() => setMenuAbierto(true)}
            aria-label="Abrir menú"
            whileTap={{ scale: 0.9 }}
          >
            ☰
          </motion.button>

          {/* NAVEGACIÓN COMPLETA EN DESKTOP */}
          <nav className="hidden sm:flex gap-4 lg:gap-6 xl:gap-8 items-center flex-wrap">
            <MarioCoinBlock />
            <Link to="/" className="nav-link hover:text-[#4FC3F7] font-semibold">Inicio</Link>
            <Link to="/productos" className="nav-link hover:text-[#4FC3F7] font-semibold">Categorías</Link>
            <Link to="/arcade" className="nav-link">Arcade</Link>
            <Link to="/nosotros" className="nav-link hover:text-[#4FC3F7] font-semibold">Nosotros</Link>
            <Link to="/contacto" className="nav-link hover:text-[#4FC3F7] font-semibold">Contáctanos</Link>
            <Link to="/carrito" className="link hover:scale-110 text-xl">🛒</Link>

            {usuario ? (
              <motion.div
                className="relative ml-4"
                ref={dropdownRef}
                onClick={() => setDropdownAbierto(!dropdownAbierto)}
                whileTap={{ scale: 0.95 }}
              >
                <div className="w-11 h-11 rounded-full overflow-hidden border-2 border-[#4FC3F7] shadow-lg hover:shadow-xl transition">
                  {usuario.photoURL ? (
                    <img
                      src={usuario.photoURL}
                      alt="Perfil"
                      className="w-full h-full object-cover rounded-full"
                    />
                  ) : (
                    <div className="w-full h-full bg-[#4FC3F7] text-white font-bold flex items-center justify-center text-xl">
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
                className="ml-4 px-4 py-2 bg-[#4FC3F7] hover:bg-[#3BB0F3] text-white font-semibold rounded-lg transition shadow-md"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Iniciar sesión
              </motion.button>
            )}
          </nav>
        </div>
      </motion.header>

      {/* Menú lateral en móvil */}
      <SidebarMenu isOpen={menuAbierto} onClose={() => setMenuAbierto(false)} />

      {/* Modal de inicio de sesión */}
      <AnimatePresence>
        {modalAbierto && (
          <AuthModal
            onClose={() => setModalAbierto(false)}
            onLogin={handleLogin}
            onSignup={handleSignup}
          />
        )}
      </AnimatePresence>

      {/* Espacio para compensar header fijo */}
      <div className="h-[100px] sm:h-[110px]" />
    </>
  );
}

export default Header;
