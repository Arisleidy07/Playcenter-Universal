import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import WaveBackground from "./WaveBackground";

const categorias = [
  { nombre: "Todos", ruta: "" },
  { nombre: "Videojuegos", ruta: "videojuegos" },
  { nombre: "Accesorios Videojuegos", ruta: "AccesoriosVideojuegos" },
  { nombre: "Consolas", ruta: "consolas" },
  { nombre: "Retro Consolas", ruta: "retro-consolas" },
  { nombre: "Coleccionables", ruta: "coleccionables" },
  { nombre: "Retro Juegos", ruta: "retro-juegos" },
  { nombre: "Controles", ruta: "controles" },
  { nombre: "Audífonos", ruta: "audifonos" },
  { nombre: "Teclados", ruta: "teclados" },
  { nombre: "Mouses", ruta: "mouses" },
  { nombre: "Laptops", ruta: "laptops" },
  { nombre: "Monitores", ruta: "monitores" },
  { nombre: "Memorias USB", ruta: "memorias-usb" },
  { nombre: "Tu Rincón Variado", ruta: "tu-rincon-variado" },
  { nombre: "Cables", ruta: "cables" },
  { nombre: "Cámaras", ruta: "camaras" },
  { nombre: "Cargadores", ruta: "cargadores" },
  { nombre: "Celulares", ruta: "celulares" },
  { nombre: "Discos Duros", ruta: "discos-duros" },
  { nombre: "Electrodomésticos", ruta: "electrodomesticos" },
  { nombre: "Gaming Chairs", ruta: "gaming-chairs" },
  { nombre: "Hogar Inteligente", ruta: "hogar-inteligente" },
  { nombre: "Impresoras", ruta: "impresoras" },
  { nombre: "Nuevos Lanzamientos", ruta: "nuevos-lanzamientos" },
  { nombre: "Ofertas Especiales", ruta: "ofertas-especiales" },
  { nombre: "Relojes Inteligentes", ruta: "relojes-inteligentes" },
  { nombre: "Smart TV", ruta: "smart-tv" },
  { nombre: "Tablets", ruta: "tablets" },
];

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

function SidebarCategorias({ categoriaActiva, mostrarEnMovil, setMostrarEnMovil }) {
  const navigate = useNavigate();

  const handleClick = (cat) => {
    navigate(`/Productos/${cat.ruta}`);
    if (setMostrarEnMovil) setMostrarEnMovil(false);
  };

  const isActiva = (nombre) => nombre === categoriaActiva;

  return (
    <>
      {/* DESKTOP */}
      <aside
        className="hidden lg:flex flex-col w-56 px-2 relative z-40"
        style={{
          height: "100vh",
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
        <div
          className="scrollbar-light relative z-10 flex-1"
          style={{
            overflowY: "auto",
            backgroundColor: "transparent",
            paddingRight: "0.25rem",
          }}
        >
          <motion.h2
            className="text-lg font-semibold mb-4 text-center tracking-wide text-blue-700 select-none"
            variants={titleVariants}
            animate="animate"
          >
            Categorías
          </motion.h2>
          <ul className="space-y-2 text-sm">
            {categorias.map((cat, idx) => (
              <motion.li key={idx} whileHover={{ scale: 1.02 }}>
                <motion.button
                  onClick={() => handleClick(cat)}
                  initial="initial"
                  whileHover="hover"
                  whileTap="tap"
                  variants={buttonVariants}
                  className={`w-full text-left px-4 py-2 rounded-md font-medium transition-colors duration-200 ${
                    isActiva(cat.nombre)
                      ? "bg-blue-100 text-blue-900 font-semibold"
                      : "bg-transparent text-blue-700 hover:bg-blue-100"
                  }`}
                  style={{ border: "none", boxShadow: "none" }}
                >
                  {cat.nombre}
                </motion.button>
              </motion.li>
            ))}
          </ul>
        </div>
      </aside>

      {/* MOBILE */}
      <AnimatePresence>
        {mostrarEnMovil && (
          <>
            <motion.div
              className="fixed inset-0 bg-gray-200 bg-opacity-40 backdrop-blur-sm z-[9998]"
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
              className="fixed top-0 left-0 h-full w-72 bg-gradient-to-b from-gray-50 to-gray-100 border border-gray-300 z-[9999] flex flex-col shadow-md"
            >
              <div className="flex justify-between items-center px-4 py-4 border-b border-gray-300">
                <h2 className="text-lg font-semibold text-blue-700 tracking-wide select-none">
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
                  {categorias.map((cat, idx) => (
                    <motion.li key={idx} whileHover={{ scale: 1.02 }}>
                      <motion.button
                        onClick={() => handleClick(cat)}
                        initial="initial"
                        whileHover="hover"
                        whileTap="tap"
                        variants={buttonVariants}
                        className={`w-full text-left px-4 py-2 rounded-md font-medium transition-colors duration-200 ${
                          isActiva(cat.nombre)
                            ? "bg-blue-100 text-blue-900 font-semibold"
                            : "bg-transparent text-blue-700 hover:bg-blue-100"
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
