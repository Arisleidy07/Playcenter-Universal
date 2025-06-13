import React from "react";
import { Link, useLocation } from "react-router-dom";

const categorias = [
    { nombre: "Todos", ruta: "" },
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
    <aside className="w-48 bg-gradient-to-br from-blue-100 to-white shadow-lg p-4 sticky top-20 h-[calc(100vh-5rem)] overflow-y-auto hidden lg:block">
        <h2 className="text-lg font-bold text-blue-700 mb-4">Categorías</h2>
        <ul className="space-y-2">
        {categorias.map((cat, idx) => {
            const activa = location.pathname === "/productos" && cat.ruta === ""
            ? true
            : location.pathname.includes(cat.ruta);

            return (
            <li key={idx}>
                <Link
                to={`/productos/${cat.ruta}`}
                className={`block px-3 py-2 rounded-lg border border-blue-300 hover:bg-blue-200 transition-all duration-200 ${
                    activa ? "bg-blue-600 text-white" : "text-gray-700"
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
