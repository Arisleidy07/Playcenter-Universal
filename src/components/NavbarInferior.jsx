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
      {/* Contenedor flotante con glass y safe-area para móviles */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 xl:hidden pointer-events-none">
        <div className="mx-auto w-[min(92%,680px)] mb-[calc(env(safe-area-inset-bottom)+8px)] rounded-2xl border border-white/30 dark:border-white/10 bg-white/85 dark:bg-gray-900/75 backdrop-blur-lg shadow-[0_8px_30px_rgba(0,0,0,0.12)] px-2 py-2 pointer-events-auto">
          <div className="flex justify-around items-center h-12">
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
              icon={
                <span style={{ fontSize: "20px" }}>
                  <FaThList />
                </span>
              }
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
          </div>
        </div>
      </nav>

      <ModalLoginAlert
        isOpen={modalAbierto}
        onClose={() => setModalAbierto(false)}
        onIniciarSesion={() => {
          setModalAbierto(false);
          abrirModal();
        }}
      />
    </>
  );
}

function NavItem({ onClick, icon, label, active }) {
  return (
    <button
      onClick={onClick}
      className={`group relative flex flex-col items-center justify-center w-full h-full gap-1 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/60 rounded-xl ${
        active
          ? "text-blue-600 dark:text-blue-400"
          : "text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
      }`}
      aria-label={label}
      aria-current={active ? "page" : undefined}
      type="button"
    >
      <div
        className={`px-2 py-1 rounded-md flex flex-col items-center transition-all duration-200 group-active:scale-95`}
      >
        <div className="text-[22px] leading-none">{icon}</div>
        <div className="mt-0.5 text-[10px] leading-3 font-medium tracking-wide">
          {label}
        </div>
      </div>
    </button>
  );
}

export default NavbarInferior;
