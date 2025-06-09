import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Header from './components/Header';

import Home from './pages/Home';
import Productos from './pages/Productos';
import Favoritos from './pages/Favoritos';
import Carrito from './pages/Carrito';
import Nosotros from './pages/Nosotros';
import Contacto from './pages/Contacto';

function App() {
  return (
    <>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/productos" element={<Productos />} />
        <Route path="/favoritos" element={<Favoritos />} />
        <Route path="/carrito" element={<Carrito />} />
        <Route path="/nosotros" element={<Nosotros />} />
        <Route path="/contacto" element={<Contacto />} />
      </Routes>
    </>
  );
}

export default App;
