import React from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaHome, FaThList, FaInfoCircle, FaEnvelope, FaShoppingCart, FaTimes } from 'react-icons/fa';

function SidebarMenu({ isOpen, onClose }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Fondo oscuro desenfocado */}
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm z-40"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Sidebar deslizable */}
          <motion.div
            className="fixed top-0 left-0 h-full w-72 max-w-[90%] bg-white shadow-xl z-50 flex flex-col"
            role="dialog"
            aria-modal="true"
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            {/* Encabezado */}
            <div className="flex items-center justify-between px-5 py-4 border-b shadow-sm bg-gradient-to-r from-indigo-600 to-indigo-400 text-white">
              <h2 className="text-lg font-bold tracking-wide">Playcenter</h2>
              <button
                onClick={onClose}
                className="text-2xl hover:rotate-90 transform transition duration-200"
                aria-label="Cerrar menú"
              >
                <FaTimes />
              </button>
            </div>

            {/* Enlaces animados */}
            <nav className="flex flex-col gap-2 px-6 py-6 text-base font-medium text-gray-700">
              <SidebarLink to="/" icon={<FaHome />} onClose={onClose}>
                Inicio
              </SidebarLink>
              <SidebarLink to="/categorias" icon={<FaThList />} onClose={onClose}>
                Categorías
              </SidebarLink>
              <SidebarLink to="/nosotros" icon={<FaInfoCircle />} onClose={onClose}>
                Nosotros
              </SidebarLink>
              <SidebarLink to="/contacto" icon={<FaEnvelope />} onClose={onClose}>
                Contáctanos
              </SidebarLink>
              <SidebarLink to="/carrito" icon={<FaShoppingCart />} onClose={onClose}>
                Carrito
              </SidebarLink>
            </nav>

            <div className="mt-auto px-6 pb-6 text-sm text-gray-400">
              © {new Date().getFullYear()} Playcenter Universal
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function SidebarLink({ to, icon, children, onClose }) {
  return (
    <motion.div
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      className="transition"
    >
      <Link
        to={to}
        onClick={onClose}
        className="flex items-center gap-3 px-4 py-2 rounded-md hover:bg-indigo-100 hover:text-indigo-700 transition-colors"
      >
        <span className="text-indigo-500 text-lg">{icon}</span>
        <span>{children}</span>
      </Link>
    </motion.div>
  );
}

export default SidebarMenu;
