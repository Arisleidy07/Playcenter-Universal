// src/components/NavbarInferior.jsx
import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FaHome, FaThList, FaShoppingCart, FaUser } from "react-icons/fa";
import { useAuth } from "../context/AuthContext";
import ModalLoginAlert from "./ModalLoginAlert";

function NavbarInferior() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { usuario } = useAuth();
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
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t shadow-md flex justify-around items-center h-14 text-sm lg:hidden">
        <NavItem
          onClick={() => handleClick("/")}
          icon={<FaHome />}
          label="Inicio"
          active={isActive("/")}
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
      />
    </>
  );
}

function NavItem({ onClick, icon, label, active }) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center justify-center transition text-xs w-full py-1 ${
        active ? "text-blue-600 font-semibold" : "text-gray-500"
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
