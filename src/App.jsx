import React from "react";
import { Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Inicio from "./pages/Inicio";
import Categorias from "./pages/Categorias";
import Productos from "./pages/Productos";
import Carrito from "./pages/Carrito";
import Favoritos from "./pages/Favoritos";
import Contacto from "./pages/Contacto";
import DetalleProducto from "./pages/DetalleProducto"; // ✅ AÑADIDO
import Audifonos from "./pages/categories/Audifonos";
import Consolas from "./pages/categories/Consolas";
import DiscosDuros from "./pages/categories/DiscosDuros";
import Cargadores from "./pages/categories/Cargadores";
import Celulares from "./pages/categories/Celulares";
import Laptops from "./pages/categories/Laptops";
import Tablets from "./pages/categories/Tablets";
import Impresoras from "./pages/categories/Impresoras";
import AccesoriosVideojuegos from "./pages/categories/AccesoriosVideojuegos";
import Videojuegos from "./pages/categories/Videojuegos";
import Relojes from "./pages/categories/Relojes";
import SmartTV from "./pages/categories/SmartTV";
import Monitores from "./pages/categories/Monitores";
import Teclados from "./pages/categories/Teclados";
import Mouse from "./pages/categories/Mouse";
import MemoriaUSB from "./pages/categories/MemoriaUSB";
import GamingChairs from "./pages/categories/GamingChairs";
import HogarInteligente from "./pages/categories/HogarInteligente";
import Camaras from "./pages/categories/Camaras";
import Cables from "./pages/categories/Cables";
import NuevosLanzamientos from "./pages/categories/NuevosLanzamientos";
import OfertasEspeciales from "./pages/categories/OfertasEspeciales";


function App() {
  return (
    <>
      <Header />
      <Routes>
        <Route path="/" element={<Inicio />} />
        <Route path="/categorias" element={<Categorias />} />
        <Route path="/productos" element={<Productos />} />
        <Route path="/carrito" element={<Carrito />} />
        <Route path="/favoritos" element={<Favoritos />} />
        <Route path="/contacto" element={<Contacto />} />
        <Route path="/producto/:id" element={<DetalleProducto />} /> 
        {/* Rutas de categorías */}
        <Route path="/categoria/audifonos" element={<Audifonos />} />
        <Route path="/categoria/consolas" element={<Consolas />} />
        <Route path="/categoria/discos-duros" element={<DiscosDuros />} />
        <Route path="/categoria/cargadores" element={<Cargadores />} />
        <Route path="/categoria/celulares" element={<Celulares />} />
        <Route path="/categoria/laptops" element={<Laptops />} />
        <Route path="/categoria/tablets" element={<Tablets />} />
        <Route path="/categoria/impresoras" element={<Impresoras />} />
        <Route path="/categoria/accesorios" element={<AccesoriosVideojuegos />} />
        <Route path="/categoria/videojuegos" element={<Videojuegos />} />
        <Route path="/categoria/relojes-inteligentes" element={<Relojes />} />
        <Route path="/categoria/smart-tv" element={<SmartTV />} />
        <Route path="/categoria/monitores" element={<Monitores />} />
        <Route path="/categoria/teclados" element={<Teclados />} />
        <Route path="/categoria/mouse" element={<Mouse />} />
        <Route path="/categoria/memoria-usb" element={<MemoriaUSB />} />
        <Route path="/categoria/gaming-chairs" element={<GamingChairs />} />
        <Route path="/categoria/hogar-inteligente" element={<HogarInteligente />} />
        <Route path="/categoria/camaras" element={<Camaras />} />
        <Route path="/categoria/cables" element={<Cables />} />
        <Route path="/categoria/nuevos-lanzamientos" element={<NuevosLanzamientos />} />
        <Route path="/categoria/ofertas-especiales" element={<OfertasEspeciales />} />

      </Routes>
    </>
  );
}

export default App;
