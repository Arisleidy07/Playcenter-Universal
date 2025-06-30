import React from 'react';
import { Link } from 'react-router-dom';

function SidebarMenu({ isOpen, onClose }) {
    return (
    <div
        className={`fixed top-0 left-0 h-full w-72 bg-white shadow-lg z-50 transform transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
    >
      {/* Encabezado */}
        <div className="flex items-center justify-between px-4 py-4 border-b">
        <h2 className="text-xl font-bold">Menú</h2>
        <button onClick={onClose} className="text-2xl font-bold">
            ✖
        </button>
        </div>

      {/* Enlaces */}
        <nav className="flex flex-col gap-4 p-4 text-lg">
        <Link to="/" onClick={onClose} className="hover:text-pink-600">Inicio</Link>
        <Link to="/categorias" onClick={onClose} className="hover:text-pink-600">Categorías</Link>
        <Link to="/nosotros" onClick={onClose} className="hover:text-pink-600">Nosotros</Link>
        <Link to="/contacto" onClick={onClose} className="hover:text-pink-600">Contáctanos</Link>
        <Link to="/carrito" onClick={onClose} className="hover:text-pink-600">🛒 </Link>
        </nav>
    </div>
    );
}

export default SidebarMenu;
