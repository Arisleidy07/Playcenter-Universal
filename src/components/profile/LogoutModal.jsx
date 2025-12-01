import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LogOut } from "lucide-react";

export default function LogoutModal({ isOpen, onClose, onConfirm }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          {/* Backdrop con Blur (Efecto Cristal) */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* El Modal */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ duration: 0.2 }}
            className="relative bg-white dark:bg-[#1E293B] rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden"
          >
            {/* Header Rojo Suave */}
            <div className="bg-red-50 dark:bg-red-900/20 p-6 flex flex-col items-center justify-center border-b border-red-100 dark:border-red-900/30">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900/50 text-red-600 rounded-full flex items-center justify-center mb-3 shadow-inner">
                <LogOut size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                ¿Cerrar Sesión?
              </h3>
            </div>

            <div className="p-6 text-center">
              <p className="text-gray-500 dark:text-gray-300 mb-8">
                ¿Estás segura de que quieres salir? Tendrás que ingresar tus
                datos nuevamente para acceder a tu tienda.
              </p>

              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 py-3 px-4 rounded-xl font-bold text-gray-700 dark:text-white bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={onConfirm}
                  className="flex-1 py-3 px-4 rounded-xl font-bold text-white bg-red-600 hover:bg-red-700 shadow-lg shadow-red-600/30 transition-transform active:scale-95"
                >
                  Sí, Salir
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
