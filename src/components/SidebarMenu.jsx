import React from 'react';
import { Link } from 'react-router-dom';

function SidebarMenu({ isOpen, onClose }) {
  return (
    <div
      className={`fixed top-0 left-0 h-full w-72 max-w-[90%] bg-white shadow-lg z-50 transform transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
      role="dialog"
      aria-modal="true"
    >
      {/* Encabezado */}
      <div className="flex items-center justify-between px-4 py-4 border-b">
        <h2 className="text-xl font-bold text-gray-800">Menú</h2>
        <button
          onClick={onClose}
          className="text-2xl font-bold text-gray-500 hover:text-red-500 transition"
          aria-label="Cerrar menú"
        >
          ✖
        </button>
      </div>

      {/* Enlaces */}
      <nav className="flex flex-col gap-3 px-4 py-6 text-lg">
        <Link to="/" onClick={onClose} className="hover:text-pink-600 transition">
          Inicio
        </Link>
        <Link to="/categorias" onClick={onClose} className="hover:text-pink-600 transition">
          Categorías
        </Link>
        <Link to="/nosotros" onClick={onClose} className="hover:text-pink-600 transition">
          Nosotros
        </Link>
        <Link to="/contacto" onClick={onClose} className="hover:text-pink-600 transition">
          Contáctanos
        </Link>
        <Link to="/carrito" onClick={onClose} className="hover:text-pink-600 transition">
          🛒
        </Link>
      </nav>
    </div>
  );
}

export default SidebarMenu;
