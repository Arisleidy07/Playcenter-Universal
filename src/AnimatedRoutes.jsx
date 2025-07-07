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
import Productos from "./pages/Productos";
import ProductosTodos from "./pages/ProductosTodos";
import Categorias from "./pages/Categorias"; // ✅ Cambiado
import ResultadosBusqueda from "./pages/PaginaBusqueda";
import PrivateRoute from "./components/PrivateRoute";

export default function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route
          path="/"
          element={
            <PageTransition>
              <Inicio />
            </PageTransition>
          }
        />
        <Route
          path="/profile"
          element={
            <PrivateRoute>
              <PageTransition>
                <Profile />
              </PageTransition>
            </PrivateRoute>
          }
        />
        <Route
          path="/producto/:id"
          element={
            <PageTransition>
              <VistaProducto />
            </PageTransition>
          }
        />
        <Route
          path="/producto/:id/detalle"
          element={
            <PageTransition>
              <DetalleProducto />
            </PageTransition>
          }
        />
        <Route
          path="/carrito"
          element={
            <PageTransition>
              <Carrito />
            </PageTransition>
          }
        />
        <Route
          path="/contacto"
          element={
            <PageTransition>
              <Contacto />
            </PageTransition>
          }
        />
        <Route
          path="/nosotros"
          element={
            <PageTransition>
              <Nosotros />
            </PageTransition>
          }
        />
        <Route
          path="/buscar"
          element={
            <PageTransition>
              <ResultadosBusqueda />
            </PageTransition>
          }
        />

        {/* RUTA general de productos */}
        <Route
          path="/productos"
          element={
            <PageTransition>
              <Productos />
            </PageTransition>
          }
        >
          <Route index element={<ProductosTodos />} />
        </Route>

        {/* RUTA DINÁMICA de categorías */}
        <Route
          path="/productos/:categoria"
          element={
            <PageTransition>
              <Categorias />
            </PageTransition>
          }
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
