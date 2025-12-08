import React from "react";
import ReactDOM from "react-dom";
import { motion } from "framer-motion";
import { FaUser } from "react-icons/fa";

export default function ModalLoginAlert({ isOpen, onClose, onIniciarSesion }) {
  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div
      onClick={onClose}
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[11000] flex items-center justify-center p-4"
      style={{ top: 0, left: 0 }}
    >
      <motion.div
        onClick={(e) => e.stopPropagation()}
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-sm mx-auto z-[11001]"
        style={{
          border: "1px solid rgba(229, 231, 235, 0.2)",
          overflow: "hidden",
        }}
      >
        {/* Botón cerrar - moderno */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-9 h-9 flex items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-500 dark:text-gray-400 hover:text-red-500 transition-all duration-200 z-10"
          aria-label="Cerrar modal"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>

        {/* Contenido */}
        <div className="px-6 py-8 text-center">
          {/* Ícono */}
          <div className="mb-5 flex justify-center">
            <div className="w-16 h-16 rounded-full bg-blue-500/10 dark:bg-blue-500/20 flex items-center justify-center">
              <FaUser className="text-blue-500 text-2xl" />
            </div>
          </div>

          {/* Título */}
          <h2 className="text-2xl font-bold mb-3 text-gray-900 dark:text-white">
            Inicia sesión
          </h2>

          {/* Descripción */}
          <p className="text-base text-gray-600 dark:text-gray-300 mb-8 px-2">
            Necesitas iniciar sesión para acceder a esta función
          </p>

          {/* Botones */}
          <div className="flex flex-col sm:flex-row gap-3">
            <motion.button
              onClick={() => {
                onClose();
                onIniciarSesion();
              }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex-1 px-6 py-3.5 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white rounded-xl font-semibold shadow-lg shadow-blue-500/30 transition-all duration-200"
              style={{ minHeight: "48px" }}
            >
              Iniciar sesión
            </motion.button>
            <motion.button
              onClick={onClose}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex-1 px-6 py-3.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-xl font-semibold transition-all duration-200"
              style={{ minHeight: "48px" }}
            >
              Cancelar
            </motion.button>
          </div>
        </div>
      </motion.div>
    </div>,
    document.body
  );
}
