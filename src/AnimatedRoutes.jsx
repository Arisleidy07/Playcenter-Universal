import React from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";

import Inicio from "./pages/Inicio";
import Profile from "./pages/Profile";
import VistaProducto from "./pages/VistaProducto";
import Carrito from "./pages/Carrito";
import Contacto from "./pages/Contacto";
import Nosotros from "./pages/Nosotros";
import DetalleProducto from "./pages/DetalleProducto";
import PaginaBusqueda from "./pages/PaginaBusqueda";
import ProductosPage from "./pages/ProductosPage";  // Importa tu page única

import PrivateRoute from "./components/PrivateRoute";

export default function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageTransition><Inicio /></PageTransition>} />

        <Route
          path="/profile"
          element={
            <PrivateRoute>
              <PageTransition><Profile /></PageTransition>
            </PrivateRoute>
          }
        />

        <Route path="/producto/:id" element={<PageTransition><VistaProducto /></PageTransition>} />
        <Route path="/producto/:id/detalle" element={<PageTransition><DetalleProducto /></PageTransition>} />
        <Route path="/carrito" element={<PageTransition><Carrito /></PageTransition>} />
        <Route path="/contacto" element={<PageTransition><Contacto /></PageTransition>} />
        <Route path="/nosotros" element={<PageTransition><Nosotros /></PageTransition>} />
        <Route path="/buscar" element={<PageTransition><PaginaBusqueda /></PageTransition>} />
        <Route path="/categorias" element={<PageTransition><ProductosPage /></PageTransition>} />



        {/* Aquí la magia: productos con categoría opcional */}
        <Route
          path="/productos/:categoria?"
          element={<PageTransition><ProductosPage /></PageTransition>}
        />
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
