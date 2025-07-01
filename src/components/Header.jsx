import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import SearchBar from "./SearchBar";
import SidebarMenu from "./SidebarMenu";
import { useAuth } from "../context/AuthContext";
import AuthModal from "./AuthModal";
import { motion, AnimatePresence } from "framer-motion";
import MarioCoinBlock from "./MarioCoinBlock";
import { FaMapMarkerAlt, FaSearch, FaTimes } from "react-icons/fa";

function Header() {
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [dropdownAbierto, setDropdownAbierto] = useState(false);
  const [buscarActivo, setBuscarActivo] = useState(false);
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
        className="fixed top-0 left-0 w-full bg-white shadow-md z-[9999] px-4 sm:px-6 md:px-8 py-2"
        style={{ backdropFilter: "saturate(180%) blur(15px)" }}
      >
        <div className="flex items-center justify-between w-full gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            <motion.img
              src="/playcenter.jpeg"
              alt="Playcenter Universal"
              className="h-9 sm:h-12 object-contain"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
            />
          </Link>

          {/* Buscador solo en escritorio */}
          <div className="hidden sm:block flex-1 max-w-md">
            <SearchBar />
          </div>

          {/* Íconos en móvil */}
          <div className="flex sm:hidden items-center gap-3">
            <motion.button
              onClick={() => setBuscarActivo(true)}
              className="text-xl text-gray-700"
              aria-label="Buscar"
              whileTap={{ scale: 0.9 }}
            >
              <FaSearch />
            </motion.button>

            <motion.button
              onClick={() => setMenuAbierto(true)}
              className="text-2xl text-gray-700"
              aria-label="Abrir menú"
              whileTap={{ scale: 0.9 }}
            >
              ☰
            </motion.button>
                   </div>
        </div>
      </motion.header>

      {/* Buscador móvil (overlay completo) */}
      <AnimatePresence>
        {buscarActivo && (
          <>
            <motion.div
              className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm z-[9997]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setBuscarActivo(false)}
            />

            <motion.div
              className="fixed top-20 left-0 right-0 z-[9999] px-4"
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <div className="relative bg-white rounded-full shadow-lg px-4 py-2 flex items-center gap-3">
                <SearchBar />
                <button
                  onClick={() => setBuscarActivo(false)}
                  className="text-gray-500 hover:text-red-500 transition text-xl"
                >
                  <FaTimes />
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Menú lateral móvil */}
      <SidebarMenu isOpen={menuAbierto} onClose={() => setMenuAbierto(false)} />

      {/* Modal de autenticación */}
      <AnimatePresence>
        {modalAbierto && (
          <AuthModal
            onClose={() => setModalAbierto(false)}
            onLogin={handleLogin}
            onSignup={handleSignup}
          />
        )}
      </AnimatePresence>

      {/* Margen para compensar header fijo */}
      <div className="h-[90px] sm:h-[110px]" />
    </>
  );
}

export default Header;

          
