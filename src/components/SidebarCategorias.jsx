import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useCategories } from "../hooks/useProducts";
import WaveBackground from "./WaveBackground";
import "../styles/SidebarCategorias.css";
import { FaThList } from "react-icons/fa";

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
    navigate(`/productos/${cat.ruta}`);
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
      {/* DESKTOP: Drawer desde la izquierda (mismo tamaño que filtros) */}
      <div
        className={`hidden xl:flex fixed inset-0 z-[9998] transition-opacity duration-200 ${
          mostrarEnMovil ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setMostrarEnMovil(false)}
        style={{
          background: isDarkMode
            ? "rgba(0, 0, 0, 0.35)"
            : "rgba(0, 0, 0, 0.25)",
          backdropFilter: "blur(6px)",
          WebkitBackdropFilter: "blur(6px)",
        }}
      />
      <div
        className={`hidden xl:flex fixed top-0 left-0 h-full w-full max-w-xs xl:max-w-sm bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 z-[9999] flex-col shadow-2xl transform transition-transform duration-300 ${
          mostrarEnMovil ? "translate-x-0" : "-translate-x-full"
        }`}
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-3 py-2 sm:px-4 sm:py-3 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
          <div className="flex items-center gap-2">
            <FaThList className="text-blue-600" size={20} />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Categorías
            </h2>
          </div>
          <button
            onClick={() => setMostrarEnMovil(false)}
            className="ml-auto p-1.5 sm:p-2 rounded-full bg-red-600 hover:bg-red-700 text-white transition-all duration-200 hover:scale-105"
            aria-label="Cerrar"
          >
            <svg
              className="w-4 h-4 sm:w-5 sm:h-5 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
            >
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-3 sm:p-4">
          <div className="grid grid-cols-1 gap-2">
            {allCategories.map((cat, idx) => (
              <motion.button
                key={cat.id || idx}
                onClick={() => handleClick(cat)}
                whileTap={{ scale: 0.98 }}
                className={`w-full px-3 py-2 rounded-lg text-[15px] sm:text-base font-medium text-left min-w-0 whitespace-normal break-words leading-snug transition-all border ${
                  isActiva(cat.nombre)
                    ? "border-blue-500 bg-blue-50 text-blue-800 dark:bg-blue-900/20 dark:text-blue-200"
                    : "border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:border-blue-300 dark:hover:border-blue-600"
                }`}
              >
                {cat.nombre}
              </motion.button>
            ))}
          </div>
        </div>
      </div>

      {/* MOBILE */}
      <AnimatePresence>
        {mostrarEnMovil && (
          <>
            {/* Overlay */}
            <motion.div
              className="xl:hidden fixed inset-0 z-[9998]"
              style={{
                background: isDarkMode
                  ? "rgba(0, 0, 0, 0.35)"
                  : "rgba(0, 0, 0, 0.25)",
                backdropFilter: "blur(6px)",
                WebkitBackdropFilter: "blur(6px)",
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMostrarEnMovil(false)}
            />

            {/* Mobile drawer (slides from left) */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ type: "spring", stiffness: 300, damping: 26 }}
              className="xl:hidden fixed inset-0 z-[9999] flex items-start justify-start p-0"
              role="dialog"
              aria-modal="true"
            >
              <motion.div
                initial={{ x: -320 }}
                animate={{ x: 0 }}
                exit={{ x: -320 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="w-72 sm:w-80 max-w-[85vw] bg-white dark:bg-gray-900 rounded-r-2xl shadow-2xl flex flex-col h-full overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Header compacto */}
                <div className="flex items-center justify-between px-3 py-2.5 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
                  <div className="flex items-center gap-2">
                    <FaThList
                      className="text-blue-600 dark:text-blue-400"
                      size={16}
                    />
                    <h2 className="text-base font-semibold text-gray-900 dark:text-white">
                      Categorías
                    </h2>
                  </div>
                  <button
                    onClick={() => setMostrarEnMovil(false)}
                    className="p-1.5 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-colors"
                    aria-label="Cerrar"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>

                {/* Content compacto y uniforme */}
                <div className="flex-1 overflow-y-auto p-3 bg-white dark:bg-gray-900">
                  <div className="grid grid-cols-1 gap-2">
                    {allCategories.map((cat, idx) => (
                      <motion.button
                        key={cat.id || idx}
                        onClick={() => handleClick(cat)}
                        whileTap={{ scale: 0.98 }}
                        className={`w-full px-3 py-2.5 rounded-lg text-sm font-medium text-left min-w-0 whitespace-normal break-words transition-colors ${
                          isActiva(cat.nombre)
                            ? "bg-blue-50 border border-blue-200 text-blue-800 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-200"
                            : "hover:bg-gray-50 text-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="truncate pr-2">{cat.nombre}</span>
                          {isActiva(cat.nombre) && (
                            <div className="flex-shrink-0">
                              <svg
                                className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            </div>
                          )}
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

export default SidebarCategorias;
