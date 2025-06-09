import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Inicio from './pages/Inicio';
import Productos from './pages/Productos';
import Nosotros from './pages/Nosotros';
import Contacto from './pages/Contacto';
import Favoritos from './pages/Favoritos';
import Carrito from './pages/Carrito';
import Categorias from './pages/Categorias';

function App() {
  return (
    <>
      <Header />
      <Routes>
        <Route path="/" element={<Inicio />} />
        <Route path="/productos" element={<Productos />} />
        <Route path="/nosotros" element={<Nosotros />} />
        <Route path="/contacto" element={<Contacto />} />
        <Route path="/favoritos" element={<Favoritos />} />
        <Route path="/carrito" element={<Carrito />} />
        <Route path="/categorias/*" element={<Categorias />} />
      </Routes>
    </>
  );
}

export default App;
