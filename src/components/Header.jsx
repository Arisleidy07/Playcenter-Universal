import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import SearchBar from './SearchBar';
import './Header.css';

function Header() {
  const [menuAbierto, setMenuAbierto] = useState(false);

  return (
    <header className="header fixed top-0 left-0 w-full bg-white shadow-md z-50 px-6 py-3">
      <div className="flex items-center justify-between">
        {/* Logo */}
        <div className="logo text-3xl font-bold flex gap-[2px]">
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
          <span className="text-green-500">&nbsp;U</span>
          <span className="text-purple-500">n</span>
          <span className="text-pink-500">i</span>
          <span className="text-amber-500">v</span>
          <span className="text-teal-500">e</span>
          <span className="text-blue-600">r</span>
          <span className="text-rose-500">s</span>
          <span className="text-indigo-500">a</span>
          <span className="text-fuchsia-600">l</span>
        </div>

        {/* Botón menú móvil */}
        <button
          className="text-3xl md:hidden"
          onClick={() => setMenuAbierto(!menuAbierto)}
        >
          ☰
        </button>

        {/* SearchBar solo visible en md+ */}
        <div className="hidden md:block">
          <SearchBar />
        </div>
      </div>

      {/* Menú para desktop y móvil */}
      <nav
        className={`flex flex-col md:flex-row items-start md:items-center md:justify-between gap-3 mt-4 md:mt-0 ${
          menuAbierto ? 'block' : 'hidden'
        } md:flex`}
      >
        <div className="flex flex-col md:flex-row gap-4">
          <Link to="/" className="nav-link">Inicio</Link>
          <Link to="/categorias" className="nav-link">Categorías</Link>
          <Link to="/nosotros" className="nav-link">Nosotros</Link>
          <Link to="/contacto" className="nav-link">Contáctanos</Link>
        </div>

        <div className="flex flex-col md:flex-row gap-4">
          <Link to="/favoritos" className="link hover-animate">
            <span className="link-icon">❤️</span>
            <span className="link-title">Favoritos</span>
          </Link>
          <Link to="/carrito" className="link hover-animate">
            <span className="link-icon">🛒</span>
            <span className="link-title">Mi carrito</span>
          </Link>
        </div>

        {/* Buscador en modo móvil */}
        <div className="block md:hidden w-full">
          <SearchBar />
        </div>
      </nav>
    </header>
  );
}

export default Header;
