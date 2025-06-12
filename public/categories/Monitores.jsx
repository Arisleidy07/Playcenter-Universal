// src/categories/Monitores.jsx
import React from "react";
import { Link } from "react-router-dom";

function Monitores() {
    const productos = [
    {
        id: 501,
        nombre: "Monitor LG 24” Full HD",
        imagen: "/products/monitor-lg-24.png",
        precio: 129.99,
    },
    {
        id: 502,
        nombre: "Monitor Curvo Samsung 27”",
        imagen: "/products/monitor-samsung-curvo.png",
        precio: 189.99,
    },
    {
        id: 503,
        nombre: "Monitor Gamer ASUS 144Hz",
        imagen: "/products/monitor-asus-gamer.png",
        precio: 249.99,
    },
    ];

    return (
    <div className="p-6 pt-28 bg-white min-h-screen">
        <h1 className="text-3xl font-bold mb-8 text-gray-800">Monitores</h1>
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

export default Monitores;
