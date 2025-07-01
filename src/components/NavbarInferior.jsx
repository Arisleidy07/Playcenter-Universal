import React from "react";
import { Link, useLocation } from "react-router-dom";
import { FaHome, FaThList, FaShoppingCart, FaUser } from "react-icons/fa";

function NavbarInferior() {
  const { pathname } = useLocation();

  const isActive = (path) => pathname === path;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t shadow-md flex justify-around items-center h-14 text-sm lg:hidden">
      <NavItem to="/" icon={<FaHome />} label="Inicio" active={isActive("/")} />
      <NavItem to="/categorias" icon={<FaThList />} label="Categorías" active={isActive("/categorias")} />
      <NavItem to="/carrito" icon={<FaShoppingCart />} label="Carrito" active={isActive("/carrito")} />
      <NavItem to="/profile" icon={<FaUser />} label="Perfil" active={isActive("/profile")} />

    </nav>
  );
}

function NavItem({ to, icon, label, active }) {
  return (
    <Link to={to} className={`flex flex-col items-center justify-center transition text-xs ${active ? "text-blue-600 font-semibold" : "text-gray-500"}`}>
      <div className="text-lg">{icon}</div>
      <div>{label}</div>
    </Link>
  );
}

export default NavbarInferior;
