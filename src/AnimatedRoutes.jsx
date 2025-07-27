import React from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import Admin from "./pages/Admin";
import { AuthProvider } from "./context/AuthContext";
import Inicio from "./pages/Inicio";
import Profile from "./pages/Profile";
import VistaProducto from "./pages/VistaProducto";
import Carrito from "./pages/Carrito";
import Contacto from "./pages/Contacto";
import Nosotros from "./pages/Nosotros";
import DetalleProducto from "./pages/DetalleProducto";
import PaginaBusqueda from "./pages/PaginaBusqueda";
import ProductosPage from "./pages/ProductosPage";
import Estafetas from "./pages/estafetas";
import PrivateRoute from "./components/PrivateRoute";

export default function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AuthProvider>
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
          <Route path="/admin" element={<Admin />} />
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
                <PaginaBusqueda />
              </PageTransition>
            }
          />
          <Route
            path="/categorias"
            element={
              <PageTransition>
                <ProductosPage />
              </PageTransition>
            }
          />
          <Route
            path="/Productos/:categoria?"
            element={
              <PageTransition>
                <ProductosPage />
              </PageTransition>
            }
          />
          <Route
            path="/estafetas"
            element={
              <PageTransition>
                <Estafetas />
              </PageTransition>
            }
          />
        </Routes>
      </AnimatePresence>
    </AuthProvider>
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

