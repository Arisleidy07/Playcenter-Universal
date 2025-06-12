// src/categories/OfertaEspeciales.jsx
import React from "react";
import { Link } from "react-router-dom";

function OfertaEspeciales() {
    const productos = [
    {
        id: 801,
        nombre: "Combo Gamer: Mouse + Teclado + Audífonos",
        imagen: "/products/combo-gamer.png",
        precio: 79.99,
    },
    {
        id: 802,
        nombre: "Smart TV 43'' LG + Soporte",
        imagen: "/products/smart-tv-oferta.png",
        precio: 299.99,
    },
    {
        id: 803,
        nombre: "Impresora Multifuncional Epson + Tinta",
        imagen: "/products/impresora-oferta.png",
        precio: 129.0,
    },
    ];

    return (
    <div className="p-6 pt-28 bg-white min-h-screen">
        <h1 className="text-3xl font-bold mb-8 text-gray-800">Ofertas Especiales</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {productos.map((producto) => (
            <Link
            to={`/producto/${producto.id}`}
            key={producto.id}
            className="card transform transition-transform duration-300 hover:scale-105"
            >
            <div className="bg"></div>
            <div className="blob"></div>
            <img
                src={producto.imagen}
                alt={producto.nombre}
                className="z-10 w-32 h-32 object-contain"
            />
            <h2 className="z-10 mt-4 font-semibold text-gray-800 text-center">
                {producto.nombre}
            </h2>
            <p className="z-10 text-pink-600 font-bold text-center">
                ${producto.precio}
            </p>
            </Link>
        ))}
        </div>
    </div>  
    );
}

export default OfertaEspeciales;
