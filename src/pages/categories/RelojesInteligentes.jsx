// src/categories/RelojesInteligentes.jsx
import React from "react";
import { Link } from "react-router-dom";

function RelojesInteligentes() {
    const productos = [
    {
        id: 901,
        nombre: "Smartwatch Xiaomi Mi Band 7",
        imagen: "/products/mi-band-7.png",
        precio: 49.99,
    },
    {
        id: 902,
        nombre: "Apple Watch Series 8",
        imagen: "/products/apple-watch-8.png",
        precio: 399.99,
    },
    {
        id: 903,
        nombre: "Reloj Inteligente Amazfit GTS 4",
        imagen: "/products/amazfit-gts4.png",
        precio: 119.99,
    },
    ];

    return (
    <div className="p-6 pt-28 bg-white min-h-screen">
        <h1 className="text-3xl font-bold mb-8 text-gray-800">Relojes Inteligentes</h1>
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

export default RelojesInteligentes;
