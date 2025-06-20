import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import SearchBar from './SearchBar';
import SidebarMenu from './SidebarMenu';

function Header() {
  const [menuAbierto, setMenuAbierto] = useState(false);

  return (
    <>
      <header className="fixed top-0 left-0 w-full bg-white shadow-md z-[9999] flex flex-col md:flex-row items-center justify-between px-6 py-3 gap-4 md:gap-8">
        <div className="logo text-2xl sm:text-3xl font-bold flex flex-wrap gap-[2px] leading-none">
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
          <span className="text-green-500">Universal</span>
        </div>

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
        </nav>
      </header>

      <SidebarMenu isOpen={menuAbierto} onClose={() => setMenuAbierto(false)} />
    </>
  );
}

export default Header;