import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useCategories } from "../hooks/useProducts";
import WaveBackground from "./WaveBackground";
import "../styles/SidebarCategorias.css";

const buttonVariants = {
  initial: { scale: 1, boxShadow: "none" },
  hover: {
    scale: 1.04,
    boxShadow: "0 4px 8px rgba(60, 80, 120, 0.2)",
    transition: { type: "spring", stiffness: 200, damping: 20 },
  },
  tap: {
    scale: 0.97,
    boxShadow: "0 0 4px rgba(60, 80, 120, 0.4)",
  },
};

const titleVariants = {
  animate: {
    textShadow: [
      "0 0 4px rgba(80, 100, 140, 0.4)",
      "0 0 10px rgba(80, 100, 140, 0.6)",
      "0 0 4px rgba(80, 100, 140, 0.4)",
    ],
    transition: {
      repeat: Infinity,
      repeatType: "mirror",
      duration: 3,
      ease: "easeInOut",
    },
  },
};

function SidebarCategorias({
  categoriaActiva,
  mostrarEnMovil,
  setMostrarEnMovil,
}) {
  const navigate = useNavigate();
  const { categories, loading, error } = useCategories();

  const handleClick = (cat) => {
    navigate(`/Productos/${cat.ruta}`);
    if (setMostrarEnMovil) setMostrarEnMovil(false);
  };

  const isActiva = (nombre) => nombre === categoriaActiva;

  // Create categories array with "Todos" option and database categories
  const allCategories = [
    { nombre: "Todos", ruta: "", id: "todos" },
    ...categories,
  ];

  if (loading) {
    return (
      <aside className="hidden xl:flex flex-col w-56 px-2 relative z-40">
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-700"></div>
        </div>
      </aside>
    );
  }

  if (error) {
    return (
      <aside className="hidden xl:flex flex-col w-56 px-2 relative z-40">
        <div className="text-red-500 text-sm p-4">
          Error cargando categorías
        </div>
      </aside>
    );
  }

  return (
    <>
      {/* DESKTOP */}
      <aside
        className="hidden xl:flex flex-col w-56 px-2 relative z-40"
        style={{
          height: "100vh",
          paddingTop: 0,
          backgroundColor: "transparent",
          border: "none",
          boxShadow: "none",
        }}
        aria-label="Categorías"
      >
        {/* Fondo animado */}
        <div
          className="absolute inset-0 z-0"
          style={{
            overflow: "visible",
            minHeight: "2000px",
            backgroundColor: "transparent",
            pointerEvents: "none",
          }}
        >
          <WaveBackground />
        </div>

        {/* Lista scrollable */}
        <div className="sidebar-scroll" style={{ height: "calc(100vh - 64px)" }}>
            <div className="relative z-10">
              <motion.h2
                className="text-lg font-semibold mb-4 text-center tracking-wide text-blue-700 dark:text-blue-400 select-none"
                variants={titleVariants}
                animate="animate"
              >
                Categorías
              </motion.h2>
              <ul className="space-y-2 text-sm">
                {allCategories.map((cat, idx) => (
                  <motion.li key={cat.id || idx} whileHover={{ scale: 1.02 }}>
                    <motion.button
                      onClick={() => handleClick(cat)}
                      initial="initial"
                      whileHover="hover"
                      whileTap="tap"
                      variants={buttonVariants}
                      className={`w-full text-left px-4 py-2 rounded-md font-medium transition-colors duration-200 ${
                        isActiva(cat.nombre)
                          ? "bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100 font-semibold"
                          : "bg-transparent text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900"
                      }`}
                      style={{ border: "none", boxShadow: "none" }}
                    >
                      {cat.nombre}
                    </motion.button>
                  </motion.li>
                ))}
              </ul>
              <div className="scroll-indicator">
                <div className="scroll-dots">
                  <div className="scroll-dot"></div>
                  <div className="scroll-dot"></div>
                  <div className="scroll-dot"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* MOBILE */}
      <AnimatePresence>
        {mostrarEnMovil && (
          <>
            <motion.div
              className="fixed inset-0 bg-gray-200 dark:bg-gray-900 bg-opacity-40 backdrop-blur-sm z-[9998]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMostrarEnMovil(false)}
            />
            <motion.nav
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", stiffness: 250, damping: 30 }}
              className="fixed top-0 left-0 h-full w-72 bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 border border-gray-300 dark:border-gray-700 z-[9999] flex flex-col shadow-md transition-colors duration-300"
            >
              <div className="flex justify-between items-center px-4 py-4 border-b border-gray-300 dark:border-gray-700">
                <h2 className="text-lg font-semibold text-blue-700 dark:text-blue-400 tracking-wide select-none">
                  Categorías
                </h2>
                <button
                  onClick={() => setMostrarEnMovil(false)}
                  className="text-red-500 font-bold text-2xl hover:text-red-700"
                  aria-label="Cerrar categorías"
                >
                  ✕
                </button>
              </div>

              <nav className="flex-1 overflow-y-auto px-4 py-2 scrollbar-light">
                <ul className="space-y-2 text-sm">
                  {allCategories.map((cat, idx) => (
                    <motion.li key={cat.id || idx} whileHover={{ scale: 1.02 }}>
                      <motion.button
                        onClick={() => handleClick(cat)}
                        initial="initial"
                        whileHover="hover"
                        whileTap="tap"
                        variants={buttonVariants}
                        className={`w-full text-left px-4 py-2 rounded-md font-medium transition-colors duration-200 ${
                          isActiva(cat.nombre)
                            ? "bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100 font-semibold"
                            : "bg-transparent text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900"
                        }`}
                        style={{ border: "none", boxShadow: "none" }}
                      >
                        {cat.nombre}
                      </motion.button>
                    </motion.li>
                  ))}
                </ul>
              </nav>
            </motion.nav>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

export default SidebarCategorias;
