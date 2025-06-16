import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";

const categorias = [
    { nombre: "Todos los productos", ruta: "" },
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
    const [open, setOpen] = useState(false);

    const toggleSidebar = () => setOpen(!open);

    return (
    <>
      {/* Botón hamburguesa en móviles */}
        <button
        onClick={toggleSidebar}
        className="lg:hidden fixed top-20 left-4 z-50 bg-white border border-gray-300 p-2 rounded-md shadow-md"
        >
        {open ? <X size={24} /> : <Menu size={24} />}
        </button>

      {/* Sidebar */}
        <aside
        className={`${
            open ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 fixed lg:static top-0 left-0 z-40 h-full w-60 bg-white border-r border-gray-200 shadow-md p-4 pt-24 lg:pt-4 transition-transform duration-300 ease-in-out overflow-y-auto`}
        >
        <h2 className="text-xl font-bold text-blue-800 mb-5">Categorías</h2>
        <ul className="space-y-2">
            {categorias.map((cat, idx) => {
            const rutaCompleta = `/productos/${cat.ruta}`;
            const activa =
                location.pathname === rutaCompleta ||
                (cat.ruta === "" && location.pathname === "/productos");

            return (
                <li key={idx}>
                <Link
                    to={rutaCompleta}
                    onClick={() => setOpen(false)}
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
    </>
    );
}

export default SidebarCategorias;
