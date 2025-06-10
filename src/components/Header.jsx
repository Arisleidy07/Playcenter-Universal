import React from 'react';
import { Link } from 'react-router-dom';
import SearchBar from './SearchBar'; // ✅ nombre corregido
import './Header.css';

function Header() {
  return (
    <header className="header fixed top-0 left-0 w-full bg-white shadow-md z-50 flex flex-col lg:flex-row items-center justify-between px-4 sm:px-6 py-3 gap-2 sm:gap-4">
      
      {/* Logo */}
      <div className="logo text-xl sm:text-2xl md:text-3xl font-bold flex flex-wrap justify-center lg:justify-start gap-[2px]">
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

      {/* Buscador */}
      <div className="w-full sm:w-3/4 lg:w-1/2">
        <SearchBar />
      </div>

      {/* Menú */}
      <nav className="menu flex flex-wrap justify-center lg:justify-end gap-2 sm:gap-4 items-center text-sm sm:text-base">
        <Link to="/" className="nav-link">Inicio</Link>
        <Link to="/categorias" className="nav-link">Categorías</Link>
        <Link to="/nosotros" className="nav-link">Nosotros</Link>
        <Link to="/contacto" className="nav-link">Contáctanos</Link>
        <Link to="/favoritos" className="link hover-animate">
          <span className="link-icon">❤️</span>
          <span className="link-title">Favoritos</span>
        </Link>
        <Link to="/carrito" className="link hover-animate">
          <span className="link-icon">🛒</span>
          <span className="link-title">Mi carrito</span>
        </Link>
      </nav>
    </header>
