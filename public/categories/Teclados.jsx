// src/categories/Teclados.jsx
import React from "react";
import { Link } from "react-router-dom";

function Teclados() {
    const productos = [
    {
        id: 1201,
        nombre: "Teclado Mecánico RGB - Redragon",
        imagen: "/products/teclado-redragon.png",
        precio: 49.99,
    },
    {
        id: 1202,
        nombre: "Teclado inalámbrico Logitech K380",
        imagen: "/products/teclado-logitech.png",
        precio: 39.99,
    },
    {
        id: 1203,
        nombre: "Teclado Gaming HyperX Alloy",
        imagen: "/products/teclado-hyperx.png",
        precio: 79.99,
    },
    ];

    return (
    <div className="p-6 pt-28 bg-white min-h-screen">
        <h1 className="text-3xl font-bold mb-8 text-gray-800">Teclados</h1>
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

export default Teclados;
