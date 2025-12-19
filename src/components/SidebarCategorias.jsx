import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useCategories } from "../hooks/useProducts";
import WaveBackground from "./WaveBackground";
import "../styles/SidebarCategorias.css";

const buttonVariants = {
  initial: { scale: 1, boxShadow: "none" },
  hover: {
    scale: 1.02,
    boxShadow: "none",
    transition: { type: "spring", stiffness: 200, damping: 20 },
  },
  tap: {
    scale: 0.98,
    boxShadow: "none",
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
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const checkTheme = () => {
      setIsDarkMode(
        document.documentElement.classList.contains("dark") ||
          document.documentElement.classList.contains("dark-theme")
      );
    };
    checkTheme();
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => observer.disconnect();
  }, []);

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
      <aside
        className="hidden xl:flex flex-col w-56 px-2 relative z-40"
        style={{ paddingTop: "60px" }}
      >
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-700"></div>
        </div>
      </aside>
    );
  }

  if (error) {
    return (
      <aside
        className="hidden xl:flex flex-col w-56 px-2 relative z-40"
        style={{ paddingTop: "60px" }}
      >
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
          paddingTop: "60px",
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
        <div className="categorias-sidebar">
          <div className="categorias-scroll">
            <div className="relative z-10 flex-1 pr-2">
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
                      className={`w-full text-left px-4 py-2 rounded-md font-medium transition-all duration-200 ${
                        isActiva(cat.nombre)
                          ? "text-blue-900 dark:text-blue-100 font-semibold border border-blue-300 dark:border-blue-400"
                          : "text-blue-700 dark:text-blue-300 border border-gray-200 dark:border-gray-600"
                      }`}
                      style={{
                        backgroundColor: isActiva(cat.nombre)
                          ? "rgba(255, 255, 255, 0.25)"
                          : "rgba(255, 255, 255, 0.12)",
                        backdropFilter: "blur(10px)",
                        WebkitBackdropFilter: "blur(10px)",
                        boxShadow: "none",
                      }}
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
            {/* Overlay transparente */}
            <motion.div
              className="fixed inset-0 z-[9998]"
              style={{
                background: isDarkMode
                  ? "rgba(0, 0, 0, 0.3)"
                  : "rgba(255, 255, 255, 0.2)",
                backdropFilter: "blur(8px)",
                WebkitBackdropFilter: "blur(8px)",
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMostrarEnMovil(false)}
            />
            {/* Sidebar sólido */}
            <motion.nav
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", stiffness: 250, damping: 30 }}
              className="fixed top-0 left-0 h-full w-72 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 z-[9999] flex flex-col shadow-2xl transition-colors duration-300"
            >
              {/* Header con gradiente AZUL */}
              <div className="flex justify-between items-center px-4 py-4 bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-700 dark:to-blue-800">
                <h2 className="text-lg font-bold text-white tracking-wide select-none flex items-center gap-2">
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.5"
                  >
                    <path d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                  Categorías
                </h2>
                <button
                  onClick={() => setMostrarEnMovil(false)}
                  className="text-white font-bold text-2xl hover:bg-white/20 rounded-full w-8 h-8 flex items-center justify-center transition-all duration-200"
                  aria-label="Cerrar categorías"
                >
                  ✕
                </button>
              </div>

              {/* Contenido con fondo moderno */}
              <div className="flex-1 overflow-y-auto px-4 py-4 bg-gradient-to-b from-gray-50 to-white dark:from-gray-800 dark:to-gray-900">
                <ul className="space-y-2 text-sm">
                  {allCategories.map((cat, idx) => (
                    <motion.li key={cat.id || idx} whileHover={{ scale: 1.02 }}>
                      <motion.button
                        onClick={() => handleClick(cat)}
                        initial="initial"
                        whileHover="hover"
                        whileTap="tap"
                        variants={buttonVariants}
                        className={`w-full text-left px-4 py-3 rounded-xl font-semibold transition-all duration-300 border-2 shadow-sm hover:shadow-md ${
                          isActiva(cat.nombre)
                            ? "text-blue-800 dark:text-blue-100 border-blue-400 dark:border-blue-500 shadow-blue-200 dark:shadow-blue-900/30"
                            : "text-gray-700 dark:text-gray-200 border-gray-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-600"
                        }`}
                        style={{
                          backgroundColor: isActiva(cat.nombre)
                            ? isDarkMode
                              ? "rgba(37, 99, 235, 0.15)"
                              : "rgba(219, 234, 254, 0.8)"
                            : isDarkMode
                            ? "rgba(255, 255, 255, 0.05)"
                            : "rgba(255, 255, 255, 0.9)",
                          backdropFilter: "blur(12px)",
                          WebkitBackdropFilter: "blur(12px)",
                        }}
                      >
                        {cat.nombre}
                      </motion.button>
                    </motion.li>
                  ))}
                </ul>
              </div>
            </motion.nav>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

export default SidebarCategorias;
