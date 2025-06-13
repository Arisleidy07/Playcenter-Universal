// src/App.jsx
import React from "react";
import { Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Inicio from "./pages/Inicio";
import Productos from "./pages/Productos";
import Carrito from "./pages/Carrito";
import Favoritos from "./pages/Favoritos";
import Contacto from "./pages/Contacto";
import DetalleProducto from "./pages/DetalleProducto";

// Importar todas las categorías
import AccesoriosVideojuegos from "./pages/categories/AccesoriosVideojuegos";
import Audifonos from "./pages/categories/Audifonos";
import Cables from "./pages/categories/Cables";
import Camaras from "./pages/categories/Camaras";
import Cargadores from "./pages/categories/Cargadores";
import Celulares from "./pages/categories/Celulares";
import Consolas from "./pages/categories/Consolas";
import DiscosDuros from "./pages/categories/DiscosDuros";
import Electrodomesticos from "./pages/categories/Electrodomesticos";
import GamingChairs from "./pages/categories/GamingChairs";
import HogarInteligente from "./pages/categories/HogarInteligente";
import Impresoras from "./pages/categories/Impresoras";
import Laptops from "./pages/categories/Laptops";
import MemoriasUSB from "./pages/categories/MemoriasUSB";
import Monitores from "./pages/categories/Monitores";
import Mouses from "./pages/categories/Mouses";
import NuevosLanzamientos from "./pages/categories/NuevosLanzamientos";
import OfertasEspeciales from "./pages/categories/OfertasEspeciales";
import RelojesInteligentes from "./pages/categories/RelojesInteligentes";
import SmartTV from "./pages/categories/SmartTV";
import Tablets from "./pages/categories/Tablets";
import Teclados from "./pages/categories/Teclados";
import Videojuegos from "./pages/categories/Videojuegos";

function App() {
  return (
    <>
      <Header />
      <div className="pt-20">
        <Routes>
          <Route path="/" element={<Inicio />} />

          {/* Layout de Productos con rutas anidadas */}
          <Route path="/productos" element={<Productos />}>
            <Route path="accesorios-videojuegos" element={<AccesoriosVideojuegos />} />
            <Route path="audifonos" element={<Audifonos />} />
            <Route path="cables" element={<Cables />} />
            <Route path="camaras" element={<Camaras />} />
            <Route path="cargadores" element={<Cargadores />} />
            <Route path="celulares" element={<Celulares />} />
            <Route path="consolas" element={<Consolas />} />
            <Route path="discos-duros" element={<DiscosDuros />} />
            <Route path="electrodomesticos" element={<Electrodomesticos />} />
            <Route path="gaming-chairs" element={<GamingChairs />} />
            <Route path="hogar-inteligente" element={<HogarInteligente />} />
            <Route path="impresoras" element={<Impresoras />} />
            <Route path="laptops" element={<Laptops />} />
            <Route path="memorias-usb" element={<MemoriasUSB />} />
            <Route path="monitores" element={<Monitores />} />
            <Route path="mouses" element={<Mouses />} />
            <Route path="nuevos-lanzamientos" element={<NuevosLanzamientos />} />
            <Route path="ofertas-especiales" element={<OfertasEspeciales />} />
            <Route path="relojes-inteligentes" element={<RelojesInteligentes />} />
            <Route path="smart-tv" element={<SmartTV />} />
            <Route path="tablets" element={<Tablets />} />
            <Route path="teclados" element={<Teclados />} />
            <Route path="videojuegos" element={<Videojuegos />} />
          </Route>

          <Route path="/carrito" element={<Carrito />} />
          <Route path="/favoritos" element={<Favoritos />} />
          <Route path="/contacto" element={<Contacto />} />
          <Route path="/producto/:id" element={<DetalleProducto />} />
        </Routes>
      </div>
    </>
  );
}

export default App;
