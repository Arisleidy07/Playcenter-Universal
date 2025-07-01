    import React from "react";
    import { Link, useLocation } from "react-router-dom";
    import { motion, AnimatePresence } from "framer-motion";

    const categorias = [
    { nombre: "Todos", ruta: "" },
    { nombre: "Retro Consolas", ruta: "retro-consolas" },
    { nombre: "Retro Juegos", ruta: "retro-juegos" },
    { nombre: "Audífonos", ruta: "audifonos" },
    { nombre: "Cables", ruta: "cables" },
    { nombre: "Cámaras", ruta: "camaras" },
    { nombre: "Cargadores", ruta: "cargadores" },
    { nombre: "Celulares", ruta: "celulares" },
    { nombre: "Consolas", ruta: "consolas" },
    { nombre: "Controles", ruta: "controles" },
    { nombre: "Discos Duros", ruta: "discos-duros" },
    { nombre: "Electrodomésticos", ruta: "electrodomesticos" },
    { nombre: "Gaming Chairs", ruta: "gaming-chairs" },
    { nombre: "Hogar Inteligente", ruta: "hogar-inteligente" },
    { nombre: "Impresoras", ruta: "impresoras" },
    { nombre: "Laptops", ruta: "laptops" },
    { nombre: "Memorias USB", ruta: "memorias-usb" },
    { nombre: "Monitores", ruta: "monitores" },
    { nombre: "Mouses", ruta: "mouses" },
    { nombre: "Nuevos Lanzamientos", ruta: "nuevos-lanzamientos" },
    { nombre: "Ofertas Especiales", ruta: "ofertas-especiales" },
    { nombre: "Relojes Inteligentes", ruta: "relojes-inteligentes" },
    { nombre: "Smart TV", ruta: "smart-tv" },
    { nombre: "Tablets", ruta: "tablets" },
    { nombre: "Teclados", ruta: "teclados" },
    { nombre: "Videojuegos", ruta: "videojuegos" },
    { nombre: "Accesorios Videojuegos", ruta: "accesorios-videojuegos" },
    ];

    function SidebarCategorias({ categoriaActiva, setCategoriaActiva, mostrarEnMovil }) {
    const location = useLocation();

    const isActiva = (nombre, ruta) =>
        categoriaActiva === nombre ||
        location.pathname === `/productos/${ruta}` ||
        (ruta === "" && location.pathname === "/productos");

    const listaCategorias = (
        <ul className="space-y-1 text-sm">
        {categorias.map((cat, idx) => (
            <li key={idx}>
            <button
                onClick={() => setCategoriaActiva(cat.nombre)}
                className={`w-full text-left px-3 py-2 rounded-md font-medium transition-colors duration-200 break-words ${
                isActiva(cat.nombre, cat.ruta)
                    ? "bg-blue-600 text-white shadow"
                    : "text-gray-700 hover:bg-blue-100 hover:text-blue-800"
                }`}
            >
                {cat.nombre}
            </button>
            </li>
        ))}
        </ul>
    );

    return (
        <>
        {/* Sidebar en escritorio */}
        <aside className="hidden sm:block w-44 md:w-52 flex-shrink-0 bg-white border-r border-gray-200 shadow px-2 py-4 sticky top-20 h-[calc(100vh-5rem)] overflow-y-auto z-30">
            <h2 className="text-sm font-bold text-blue-800 mb-4 text-center uppercase tracking-wide select-none">
            Categorías
            </h2>
            {listaCategorias}
        </aside>

        {/* Modal móvil */}
        <AnimatePresence>
            {mostrarEnMovil && (
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
                className="fixed top-20 left-0 right-0 mx-auto max-w-xs bg-white border border-gray-200 shadow-lg rounded-lg z-[9998] px-4 py-4"
            >
                <h2 className="text-base font-bold text-blue-800 mb-3 text-center uppercase">
                Categorías
                </h2>
                {listaCategorias}
            </motion.div>
            )}
        </AnimatePresence>
        </>
    );
    }

    export default SidebarCategorias;
