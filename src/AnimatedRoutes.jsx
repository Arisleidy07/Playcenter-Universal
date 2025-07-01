import React from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";

import Inicio from "./pages/Inicio";
import Arcade from "./pages/Arcade";
import Profile from "./pages/Profile";
import VistaProducto from "./pages/VistaProducto";
import Carrito from "./pages/Carrito";
import Contacto from "./pages/Contacto";
import Nosotros from "./pages/Nosotros";
import DetalleProducto from "./pages/DetalleProducto";
import Productos from "./pages/Productos";
import ProductosTodos from "./pages/ProductosTodos";
import Categorias from "./pages/Categorias";
import ResultadosBusqueda from "./pages/ResultadosBusqueda";

// Categorías
import RetroJuegos from "./pages/categories/RetroJuegos";
import RetroConsolas from "./pages/categories/RetroConsolas";
import AccesoriosVideojuegos from "./pages/categories/AccesoriosVideojuegos";
import Audifonos from "./pages/categories/Audifonos";
import Cables from "./pages/categories/Cables";
import Camaras from "./pages/categories/Camaras";
import Cargadores from "./pages/categories/Cargadores";
import Celulares from "./pages/categories/Celulares";
import Consolas from "./pages/categories/Consolas";
import Controles from "./pages/categories/controles";
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

export default function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageTransition><Inicio /></PageTransition>} />
        <Route path="/arcade" element={<PageTransition><Arcade /></PageTransition>} />
        <Route path="/profile" element={<PageTransition><Profile /></PageTransition>} />
        <Route path="/producto/:id" element={<PageTransition><VistaProducto /></PageTransition>} />
        <Route path="/carrito" element={<PageTransition><Carrito /></PageTransition>} />
        <Route path="/contacto" element={<PageTransition><Contacto /></PageTransition>} />
        <Route path="/categorias" element={<PageTransition><Categorias /></PageTransition>} />
        <Route path="/nosotros" element={<PageTransition><Nosotros /></PageTransition>} />
        <Route path="/producto/:id/detalle" element={<PageTransition><DetalleProducto /></PageTransition>} />

        {/* RUTA /buscar --> corregida y movida afuera de /productos */}
        <Route path="/buscar" element={<PageTransition><ResultadosBusqueda /></PageTransition>} />

        <Route path="/productos" element={<PageTransition><Productos /></PageTransition>}>
          <Route index element={<ProductosTodos />} />
          <Route path="accesorios-videojuegos" element={<AccesoriosVideojuegos />} />
          <Route path="retro-consolas" element={<RetroConsolas />} />
          <Route path="retro-juegos" element={<RetroJuegos />} />
          <Route path="audifonos" element={<Audifonos />} />
          <Route path="cables" element={<Cables />} />
          <Route path="camaras" element={<Camaras />} />
          <Route path="cargadores" element={<Cargadores />} />
          <Route path="celulares" element={<Celulares />} />
          <Route path="consolas" element={<Consolas />} />
          <Route path="controles" element={<Controles />} />
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
      </Routes>
    </AnimatePresence>
  );
}

function PageTransition({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5, ease: "easeInOut" }}
    >
      {children}
    </motion.div>
  );
}
