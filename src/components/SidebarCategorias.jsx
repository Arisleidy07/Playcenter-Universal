    import React from "react";
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

    function SidebarCategorias({ categoriaActiva, setCategoriaActiva, mostrarEnMovil, setMostrarEnMovil }) {
    const isActiva = (nombre) => nombre === categoriaActiva;

    const handleClick = (nombre) => {
        setCategoriaActiva(nombre);
        if (setMostrarEnMovil) setMostrarEnMovil(false);
    };

    return (
        <>
        {/* Sidebar escritorio */}
        <aside className="hidden sm:block w-44 md:w-52 flex-shrink-0 bg-white border-r border-gray-200 shadow px-2 py-4 sticky top-20 h-[calc(100vh-5rem)] overflow-y-auto z-30">
            <h2 className="text-sm font-bold text-blue-800 mb-4 text-center uppercase tracking-wide select-none">
            Categorías
            </h2>
            <ul className="space-y-1 text-sm">
            {categorias.map((cat, idx) => (
                <li key={idx}>
                <button
                    onClick={() => handleClick(cat.nombre)}
                    className={`w-full text-left px-3 py-2 rounded-md font-medium transition duration-200 ${
                    isActiva(cat.nombre)
                        ? "bg-blue-600 text-white shadow"
                        : "text-gray-700 hover:bg-blue-100 hover:text-blue-800"
                    }`}
                >
                    {cat.nombre}
                </button>
                </li>
            ))}
            </ul>
        </aside>

        {/* Panel móvil animado tipo Bravobar */}
        <AnimatePresence>
            {mostrarEnMovil && (
            <>
                {/* Overlay oscuro con blur */}
                <motion.div
                className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-md z-[9998]"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setMostrarEnMovil(false)}
                />

                {/* Slide in panel */}
                <motion.div
                initial={{ x: -300 }}
                animate={{ x: 0 }}
                exit={{ x: -300 }}
                transition={{ type: "spring", stiffness: 280, damping: 25 }}
                className="fixed top-0 left-0 bottom-0 w-72 bg-white shadow-lg z-[9999] overflow-y-auto px-4 py-6"
                >
                <h2 className="text-base font-bold text-blue-800 mb-4 uppercase tracking-wide">
                    Categorías
                </h2>
                <ul className="space-y-2 text-sm">
                    {categorias.map((cat, idx) => (
                    <li key={idx}>
                        <button
                        onClick={() => handleClick(cat.nombre)}
                        className={`w-full text-left px-3 py-2 rounded-md font-medium transition duration-200 ${
                            isActiva(cat.nombre)
                            ? "bg-blue-600 text-white shadow"
                            : "text-gray-700 hover:bg-blue-100 hover:text-blue-800"
                        }`}
                        >
                        {cat.nombre}
                        </button>
                    </li>
                    ))}
                </ul>
                </motion.div>
            </>
            )}
        </AnimatePresence>
        </>
    );
    }

    export default SidebarCategorias;
