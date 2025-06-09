import React from "react";
import './Header.css';

function Header() {
  return (
    <header className="header fixed top-0 left-0 w-full bg-white shadow-md z-50 flex items-center justify-between px-6 py-3">
      {/* Logo con letras de colores */}
      <div className="text-3xl font-bold flex gap-[2px]">
        <span className="text-red-500">P</span>
        <span className="text-blue-500">l</span>
        <span className="text-yellow-400">a</span>
        <span className="text-green-500">y</span>
        <span className="text-cyan-500">c</span>
        <span className="text-orange-400">e</span>
        <span className="text-lime-500">n</span>
        <span className="text-red-500">t</span>
        <span className="text-blue-500">e</span>
        <span className="text-yellow-400">r</span>
        <span className="">&nbsp;</span>
        <span className="text-green-500">U</span>
        <span className="text-purple-500">n</span>
        <span className="text-pink-500">i</span>
        <span className="text-amber-500">v</span>
        <span className="text-teal-500">e</span>
        <span className="text-blue-600">r</span>
        <span className="text-rose-500">s</span>
        <span className="text-indigo-500">a</span>
        <span className="text-fuchsia-600">l</span>
      </div>

      <div className="flex items-center gap-4">
        {/* Buscador */}
        <form className="search-form">
          <button type="submit">
            <svg width="17" height="16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M7.667 12.667A5.333 5.333 0 107.667 2a5.333 5.333 0 000 10.667zM14.334 14l-2.9-2.9"
                stroke="currentColor" strokeWidth="1.333" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <input className="input" placeholder="Buscar" required type="text" />
        </form>

        {/* Menú */}
        <nav className="flex items-center gap-4">
          <a href="#" className="nav-link">Inicio</a>
          <a href="#" className="nav-link">Productos</a>
          <a href="#" className="nav-link">Nosotros</a>
          <a href="#" className="nav-link">Contáctanos</a>

          <a href="#" className="link animated-link">
            <span className="link-icon heartbeat">❤️</span>
            <span className="link-title">Favoritos</span>
          </a>
          <a href="#" className="link animated-link">
            <span className="link-icon heartbeat">🛒</span>
            <span className="link-title">Mi carrito</span>
          </a>

        </nav>
      </div>
    </header>
  );
}

export default Header;
