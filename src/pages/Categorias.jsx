// src/pages/Categorias.jsx
import React from "react";
import { Link } from "react-router-dom";

const categorias = [
    { nombre: "AccesoriosVideojuegos", ruta: "/categorias/accesoriosvideojuegos" },
    { nombre: "Audifonos", ruta: "/categorias/audifonos" },
    { nombre: "Cables", ruta: "/categorias/cables" },
    { nombre: "Camaras", ruta: "/categorias/camaras" },
    { nombre: "Cargadores", ruta: "/categorias/cargadores" },
    { nombre: "Celulares", ruta: "/categorias/celulares" },
    { nombre: "Consolas", ruta: "/categorias/consolas" },
    { nombre: "Discos Duros", ruta: "/categorias/discosduros" },
    { nombre: "Electrodomésticos", ruta: "/categorias/electrodomesticos" },
    { nombre: "Gaming Chairs", ruta: "/categorias/gamingchairs" },
    { nombre: "Hogar Inteligente", ruta: "/categorias/hogarinteligente" },
    { nombre: "Impresoras", ruta: "/categorias/impresoras" },
    { nombre: "Laptops", ruta: "/categorias/laptops" },
    { nombre: "Memorias USB", ruta: "/categorias/memoriasusb" },
    { nombre: "Monitores", ruta: "/categorias/monitores" },
    { nombre: "Mouse", ruta: "/categorias/mouses" },
    { nombre: "Nuevos Lanzamientos", ruta: "/categorias/nuevoslanzamientos" },
    { nombre: "Ofertas Especiales", ruta: "/categorias/ofertasespeciales" },
    { nombre: "Relojes Inteligentes", ruta: "/categorias/relojesinteligentes" },
    { nombre: "Smart TV", ruta: "/categorias/smarttv" },
    { nombre: "Tablets", ruta: "/categorias/tablets" },
    { nombre: "Teclados", ruta: "/categorias/teclados" },
    { nombre: "Videojuegos", ruta: "/categorias/videojuegos" },
];

function Categorias() {
    return (
    <main className="pt-24 px-6 bg-white min-h-screen">
        <h1 className="text-3xl font-bold text-center mb-10">Categorías</h1>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
        {categorias.map((cat, idx) => (
            <Link
            to={cat.ruta}
            key={idx}
            className="bg-gradient-to-br from-blue-200 to-white p-6 rounded-xl shadow hover:shadow-lg transition-all text-center font-semibold text-gray-800 hover:text-blue-700"
            >
            {cat.nombre}
            </Link>
        ))}
        </div>
    </main>
    );
}

export default Categorias;
