    import React from "react";
    import { motion, AnimatePresence } from "framer-motion";
    import { useNavigate } from "react-router-dom";

    const categorias = [
    { nombre: "Todos", ruta: "" },
    { nombre: "Tu Rincón Variado", ruta: "tu-rincon-variado" },
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

    function SidebarCategorias({
    categoriaActiva,
    mostrarEnMovil,
    setMostrarEnMovil,
    setCategoriaActiva,
    }) {
    const navigate = useNavigate();

    const handleClick = (cat) => {
        navigate(`/productos/${cat.ruta}`);
        if (setMostrarEnMovil) setMostrarEnMovil(false);
        if (setCategoriaActiva) setCategoriaActiva(cat.nombre);
    };

    const isActiva = (nombre) => nombre === categoriaActiva;

    return (
        <>
        {/* Desktop */}
        <aside
            className="hidden lg:block w-52 flex-shrink-0 bg-white border-r border-gray-200 shadow px-2 py-2 sticky top-[76px] h-[calc(100vh-4.75rem)] overflow-y-auto z-30"
            aria-label="Categorías"
        >
            <h2 className="text-sm font-bold text-blue-800 mb-3 text-center uppercase tracking-wide select-none">
            Categorías
            </h2>
            <ul className="space-y-1 text-sm">
            {categorias.map((cat, idx) => (
                <li key={idx}>
                <button
                    onClick={() => handleClick(cat)}
                    className={`w-full text-left px-3 py-2 rounded-md font-medium transition duration-200 focus:outline-none ${
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

        {/* Mobile */}
        <AnimatePresence>
            {mostrarEnMovil && (
            <>
                <motion.div
                className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm z-[1000]"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setMostrarEnMovil(false)}
                />
                <motion.nav
                initial={{ x: -300 }}
                animate={{ x: 0 }}
                exit={{ x: -300 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="fixed top-[80px] left-0 bottom-0 w-72 bg-white shadow-lg z-[1001] overflow-y-auto px-4 py-4"
                >
                <h2 className="text-base font-bold text-blue-800 mb-3 uppercase tracking-wide">
                    Categorías
                </h2>
                <ul className="space-y-2 text-sm">
                    {categorias.map((cat, idx) => (
                    <li key={idx}>
                        <button
                        onClick={() => handleClick(cat)}
                        className={`w-full text-left px-3 py-2 rounded-md font-medium transition duration-200 focus:outline-none ${
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
                </motion.nav>
            </>
            )}
        </AnimatePresence>
        </>
    );
    }

    export default SidebarCategorias;
