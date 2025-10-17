import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  FaHome,
  FaThList,
  FaShoppingCart,
  FaUser,
  FaStore,
} from "react-icons/fa";
import { useAuth } from "../context/AuthContext";
import ModalLoginAlert from "./ModalLoginAlert";
import { useAuthModal } from "../context/AuthModalContext"; // <-- asegurate que tienes este contexto

function NavbarInferior() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { usuario } = useAuth();
  const { abrirModal } = useAuthModal(); // <-- hook para abrir modal de login/register
  const [modalAbierto, setModalAbierto] = useState(false);

  const isActive = (path) => pathname === path;

  const handleClick = (to) => {
    if ((to === "/profile" || to === "/carrito") && !usuario) {
      setModalAbierto(true);
    } else {
      navigate(to);
    }
  };

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-gray-800 border-t dark:border-gray-700 shadow-md flex justify-around items-center h-14 text-sm xl:hidden transition-colors duration-300">
        <NavItem
          onClick={() => handleClick("/")}
          icon={<FaHome />}
          label="Inicio"
          active={isActive("/")}
        />
        <NavItem
          onClick={() => handleClick("/tiendas")}
          icon={<FaStore />}
          label="Tiendas"
          active={isActive("/tiendas")}
        />
        <NavItem
          onClick={() => handleClick("/categorias")}
          icon={<FaThList />}
          label="Categorías"
          active={isActive("/categorias")}
        />
        <NavItem
          onClick={() => handleClick("/carrito")}
          icon={<FaShoppingCart />}
          label="Carrito"
          active={isActive("/carrito")}
        />
        <NavItem
          onClick={() => handleClick("/profile")}
          icon={<FaUser />}
          label="Perfil"
          active={isActive("/profile")}
        />
      </nav>

      <ModalLoginAlert
        isOpen={modalAbierto}
        onClose={() => setModalAbierto(false)}
        onIniciarSesion={() => {
          setModalAbierto(false);
          abrirModal(); // abre el modal real de login/register
        }}
      />
    </>
  );
}

function NavItem({ onClick, icon, label, active }) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center justify-center w-full h-full transition-colors ${
        active
          ? "text-[#4FC3F7] font-semibold"
          : "text-gray-600 dark:text-gray-300 hover:text-[#4FC3F7] dark:hover:text-[#60a5fa]"
      }`}
      aria-label={label}
      type="button"
    >
      <div className="text-lg">{icon}</div>
      <div>{label}</div>
    </button>
  );
}

export default NavbarInferior;
