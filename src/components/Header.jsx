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
        className="fixed top-0 left-0 w-full bg-white shadow-md z-[9999] flex flex-col md:flex-row items-center justify-between px-6 py-3 gap-4 md:gap-8"
        style={{ backdropFilter: "saturate(180%) blur(15px)" }}
      >


<Link to="/" className="flex items-center gap-4">
  {/* Logo */}
  <motion.img
    src="/playcenter.jpeg"
    alt="Playcenter Universal"
    className="h-14 sm:h-16 object-contain cursor-pointer"
    whileHover={{ scale: 1.05 }}
    transition={{ type: "spring", stiffness: 300 }}
  />

{/* Texto estilo Amazon mejorado */}
<div className="hidden sm:flex flex-col leading-snug text-sm text-gray-800 font-medium">
  <span className="flex items-center gap-1 text-[13px] text-gray-600 font-normal">
    <FaMapMarkerAlt className="text-[#4FC3F7] text-base" />
    Envios 
  </span>
  <strong className="text-[15px] font-semibold text-gray-800 uppercase tracking-wide">
    EN TODO RD
  </strong>
</div>
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

        <nav className="hidden md:flex gap-6 items-center">
          <MarioCoinBlock />
          <Link to="/" className="nav-link hover:text-[#4FC3F7] transition-colors font-semibold">
            Inicio
          </Link>
          <Link to="/productos" className="nav-link hover:text-[#4FC3F7] transition-colors font-semibold">
            Categorías
          </Link>
          <Link to="/arcade" className="nav-link">
            Arcade
          </Link>

          <Link to="/nosotros" className="nav-link hover:text-[#4FC3F7] transition-colors font-semibold">
            Nosotros
          </Link>
          <Link to="/contacto" className="nav-link hover:text-[#4FC3F7] transition-colors font-semibold">
            Contáctanos
          </Link>
          <Link to="/carrito" className="link hover:scale-110 transition-transform text-xl">
            🛒
          </Link>

          {usuario ? (
            <motion.div
              className="relative ml-6 cursor-pointer"
              ref={dropdownRef}
              onClick={() => setDropdownAbierto(!dropdownAbierto)}
              whileTap={{ scale: 0.95 }}
            >
              <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-[#4FC3F7] shadow-lg hover:shadow-xl transition-shadow duration-300">
                {usuario.photoURL ? (
                  <img
                    src={usuario.photoURL}
                    alt="Perfil"
                    className="w-full h-full object-cover rounded-full"
                  />
                ) : (
                  <div className="w-full h-full bg-[#4FC3F7] text-white font-bold flex items-center justify-center text-xl select-none">
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
              className="ml-4 px-6 py-2 bg-[#4FC3F7] hover:bg-[#3BB0F3] text-white font-semibold rounded-lg transition shadow-md"
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

      {/* Aquí agrego un div para empujar el contenido y que no quede tapado por el header */}
      <div className="h-[72px] md:h-[72px]" />
    </>
  );
}

export default Header;
