// src/components/Header.jsx
import React, { useState } from "react";
import { Link } from "react-router-dom";
import SearchBar from "./SearchBar";
import SidebarMenu from "./SidebarMenu";
import { useAuth } from "../context/AuthContext";
import AuthModal from "./AuthModal";

function Header() {
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [modalAbierto, setModalAbierto] = useState(false);
  const { usuario, logout, login, signup } = useAuth();

  const manejarLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Error cerrando sesión", error);
    }
  };

  const handleLogin = async (email, password) => {
    try {
      await login(email, password);
      setModalAbierto(false); // Cierra el modal después del login
    } catch (error) {
      console.error("Error al iniciar sesión:", error);
      alert("Correo o contraseña incorrectos.");
    }
  };

  const handleSignup = async (email, password) => {
    try {
      await signup(email, password);
      setModalAbierto(false); // Cierra el modal después del signup
    } catch (error) {
      console.error("Error al registrarse:", error);
      alert("Error al crear la cuenta.");
    }
  };

  return (
    <>
      <header className="fixed top-0 left-0 w-full bg-white shadow-md z-[9999] flex flex-col md:flex-row items-center justify-between px-6 py-3 gap-4 md:gap-8">
        {/* Logo imagen clickeable */}
      <Link to="/" className="flex items-center">
          <img
            src="/playcenter.jpeg"
            alt="Playcenter Universal"
            className="h-14 sm:h-16 object-contain cursor-pointer"
          />
      </Link>

      <div className="w-full md:w-auto flex-1 max-w-md">
        <SearchBar />
      </div>

      <button className="md:hidden text-3xl" onClick={() => setMenuAbierto(true)}>
        ☰
        </button>

        <nav className="hidden md:flex gap-4 items-center">
          <Link to="/" className="nav-link">Inicio</Link>
          <Link to="/productos" className="nav-link">Categorías</Link>
          <Link to="/nosotros" className="nav-link">Nosotros</Link>
          <Link to="/contacto" className="nav-link">Contáctanos</Link>
          <Link to="/favoritos" className="link hover-animate">❤️ Favoritos</Link>
          <Link to="/carrito" className="link hover-animate">🛒 Mi carrito</Link>

          {!usuario ? (
            <button
              onClick={() => setModalAbierto(true)}
              className="ml-4 px-4 py-2 bg-[#4FC3F7] hover:bg-[#3BB0F3] text-white font-semibold rounded-lg transition"
            >
              Iniciar sesión
            </button>
          ) : (
            <button
              onClick={manejarLogout}
              className="ml-4 px-4 py-2 bg-[#EF4444] hover:bg-[#DC2626] text-white font-semibold rounded-lg transition"
            >
              Cerrar sesión
            </button>
          )}
        </nav>
      </header>

      <SidebarMenu isOpen={menuAbierto} onClose={() => setMenuAbierto(false)} />

      {modalAbierto && (
        <AuthModal
          onClose={() => setModalAbierto(false)}
          onLogin={handleLogin}
          onSignup={handleSignup}
        />
      )}
    </>
  );
}

export default Header;
