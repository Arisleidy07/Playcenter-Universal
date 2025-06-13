import React from "react";
import { Link, useLocation } from "react-router-dom";

const categorias = [
  { nombre: "Todos los productos", ruta: "" }, // <- NUEVO
    { nombre: "Accesorios Videojuegos", ruta: "accesorios-videojuegos" },
    { nombre: "Audífonos", ruta: "audifonos" },
    { nombre: "Cables", ruta: "cables" },
    { nombre: "Cámaras", ruta: "camaras" },
    { nombre: "Cargadores", ruta: "cargadores" },
    { nombre: "Celulares", ruta: "celulares" },
    { nombre: "Consolas", ruta: "consolas" },
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
];

function SidebarCategorias() {
    const location = useLocation();

    return (
    <aside className="w-52 bg-white border-r border-gray-200 shadow-md p-4 sticky top-20 h-[calc(100vh-5rem)] overflow-y-auto hidden lg:block">
        <h2 className="text-xl font-bold text-blue-800 mb-5">Categorías</h2>
        <ul className="space-y-2">
        {categorias.map((cat, idx) => {
            const rutaCompleta = `/productos/${cat.ruta}`;
            const activa = location.pathname === rutaCompleta || (cat.ruta === "" && location.pathname === "/productos");

            return (
            <li key={idx}>
                <Link
                to={rutaCompleta}
                className={`block px-4 py-2 rounded-md font-medium transition-all duration-200 ${
                    activa
                    ? "bg-blue-600 text-white"
                    : "text-gray-700 hover:bg-blue-100 hover:text-blue-800"
                }`}
                >
                {cat.nombre}
                </Link>
            </li>
            );
        })}
        </ul>
    </aside>
    );
}

export default SidebarCategorias;
