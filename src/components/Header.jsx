import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import SearchBar from "./SearchBar";
import SidebarMenu from "./SidebarMenu";
import { useAuth } from "../context/AuthContext";
import AuthModal from "./AuthModal";
import { motion, AnimatePresence } from "framer-motion";

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
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="fixed top-0 left-0 w-full bg-white shadow-md z-[9999] flex flex-col md:flex-row items-center justify-between px-6 py-3 gap-4 md:gap-8"
      >
        <Link to="/" className="flex items-center">
          <motion.img
            src="/playcenter.jpeg"
            alt="Playcenter Universal"
            className="h-14 sm:h-16 object-contain cursor-pointer"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300 }}
          />
        </Link>

        <motion.div
          className="w-full md:w-auto flex-1 max-w-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <SearchBar />
        </motion.div>

        <motion.button
          className="md:hidden text-3xl"
          onClick={() => setMenuAbierto(true)}
          aria-label="Abrir menú"
          whileTap={{ scale: 0.9 }}
        >
          ☰
        </motion.button>

        <nav className="hidden md:flex gap-4 items-center">
          <Link to="/" className="nav-link hover:text-[#4FC3F7] transition-colors">Inicio</Link>
          <Link to="/productos" className="nav-link hover:text-[#4FC3F7] transition-colors">Categorías</Link>
          <Link to="/nosotros" className="nav-link hover:text-[#4FC3F7] transition-colors">Nosotros</Link>
          <Link to="/contacto" className="nav-link hover:text-[#4FC3F7] transition-colors">Contáctanos</Link>
          <Link to="/favoritos" className="link hover:scale-105 transition-transform">❤️ Favoritos</Link>
          <Link to="/carrito" className="link hover:scale-105 transition-transform">🛒 Mi carrito</Link>

          {usuario ? (
            <motion.div
              className="relative ml-4"
              ref={dropdownRef}
              whileTap={{ scale: 0.95 }}
            >
              <Link
                to="/profile"
                className="w-10 h-10 rounded-full overflow-hidden border-2 border-[#4FC3F7]"
              >
                {usuario.photoURL ? (
                  <img
                    src={usuario.photoURL}
                    alt="Perfil"
                    className="w-full h-full object-cover rounded-full"
                  />
                ) : (
                  <div className="w-full h-full bg-[#4FC3F7] text-white font-bold flex items-center justify-center text-lg">
                    {usuario.displayName?.charAt(0).toUpperCase() || "U"}
                  </div>
                )}
              </Link>
            </motion.div>
          ) : (
            <motion.button
              onClick={() => setModalAbierto(true)}
              className="ml-4 px-4 py-2 bg-[#4FC3F7] hover:bg-[#3BB0F3] text-white font-semibold rounded-lg transition"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Iniciar sesión
            </motion.button>
          )}
        </nav>
      </motion.header>

      <SidebarMenu isOpen={menuAbierto} onClose={() => setMenuAbierto(false)} />

      <AnimatePresence>
        {modalAbierto && (
          <AuthModal
            onClose={() => setModalAbierto(false)}
            onLogin={handleLogin}
            onSignup={handleSignup}
          />
        )}
      </AnimatePresence>
    </>
  );
}

export default Header;
