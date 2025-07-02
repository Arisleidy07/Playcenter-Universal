import React from "react";
import ReactDOM from "react-dom";
import { motion } from "framer-motion";

export default function ModalLoginAlert({ isOpen, onClose, onIniciarSesion }) {
  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div
      onClick={onClose}
      className="fixed inset-0 bg-black bg-opacity-80 backdrop-blur-sm z-[11000] flex items-center justify-center p-4"
      style={{ top: 0, left: 0 }}
    >
      <motion.div
        onClick={(e) => e.stopPropagation()}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.3 }}
        className="relative bg-[#0f172a] text-white rounded-xl shadow-2xl w-full max-w-md p-6 border border-[#3b82f6]/40 z-[11001]"
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-red-500 text-2xl font-bold"
          aria-label="Cerrar modal"
        >
          &times;
        </button>

        <h2 className="text-2xl font-bold mb-4 text-center flex items-center justify-center gap-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-7 w-7 text-[#3b82f6]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5.121 17.804A11.955 11.955 0 0112 15c2.32 0 4.47.66 6.264 1.804M15 11a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
          Inicia sesión
        </h2>

        <p className="mb-6 text-center text-gray-300">
          Necesitas iniciar sesión para agregar productos al carrito.
        </p>

        <div className="flex justify-center gap-4">
          <button
            onClick={() => {
              onClose();
              onIniciarSesion();
            }}
            className="w-full max-w-[120px] px-5 py-2 bg-[#3b82f6] hover:bg-[#2563eb] rounded-lg font-semibold shadow-lg transition transform hover:scale-105"
          >
            Iniciar sesión
          </button>
          <button
            onClick={onClose}
            className="w-full max-w-[120px] px-5 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg font-semibold shadow-lg transition transform hover:scale-105"
          >
            Cancelar
          </button>
        </div>
      </motion.div>
    </div>,
    document.body
  );
}
