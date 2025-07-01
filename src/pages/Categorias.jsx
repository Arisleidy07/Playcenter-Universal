import React, { useState } from "react";
import TarjetaProducto from "../components/TarjetaProducto";
import SidebarCategorias from "../components/SidebarCategorias";
import productos from "../data/productosAll";
import { FaThList } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

function Categorias() {
  const [categoriaActiva, setCategoriaActiva] = useState("Todos");
  const [mostrarCategorias, setMostrarCategorias] = useState(false);

  const productosTodos = productos.flatMap((cat) => cat.productos);
  const productosFiltrados =
    categoriaActiva === "Todos"
      ? productosTodos
      : productosTodos.filter((p) => p.categoria === categoriaActiva);

  const handleSeleccion = (nombre) => {
    setCategoriaActiva(nombre);
    setMostrarCategorias(false);

    setTimeout(() => {
      document.getElementById("productos-seccion")?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  return (
    <main className="pt-24 px-3 sm:px-6 lg:px-12 pb-16 bg-white min-h-screen">
      {/* Botón animado fijo en móvil */}
      <div className="sm:hidden fixed top-20 left-4 z-[9999]">
        <motion.button
          onClick={() => setMostrarCategorias(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#4FC3F7] text-white rounded-full shadow-lg font-semibold text-sm"
          whileTap={{ scale: 0.95 }}
          whileHover={{ scale: 1.05 }}
        >
          <motion.div
            animate={{ rotate: mostrarCategorias ? 90 : 0 }}
            transition={{ duration: 0.3 }}
          >
            <FaThList />
          </motion.div>
          Categorías
        </motion.button>
      </div>

      <div className="flex flex-col sm:flex-row gap-6">
        <SidebarCategorias
          categoriaActiva={categoriaActiva}
          setCategoriaActiva={handleSeleccion}
          mostrarEnMovil={mostrarCategorias}
          setMostrarEnMovil={setMostrarCategorias}
        />

        <section
          id="productos-seccion"
          className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1 max-w-6xl mx-auto px-2 sm:px-4"
        >
          {productosFiltrados.map((prod) => (
            <div key={prod.id} className="w-full">
              <TarjetaProducto producto={prod} />
            </div>
          ))}
        </section>
      </div>
    </main>
  );
}

export default Categorias;
import { FaShoppingCart } from "react-icons/fa";