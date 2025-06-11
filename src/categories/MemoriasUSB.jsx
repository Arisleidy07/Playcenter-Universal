// src/categories/MemoriaUSB.jsx
import React from "react";
import { Link } from "react-router-dom";

function MemoriaUSB() {
    const productos = [
    {
        id: 401,
        nombre: "Memoria USB 32GB Kingston",
        imagen: "/products/usb-kingston-32gb.png",
        precio: 9.99,
    },
    {
        id: 402,
        nombre: "Pendrive 64GB SanDisk",
        imagen: "/products/usb-sandisk-64gb.png",
        precio: 14.99,
    },
    {
        id: 403,
        nombre: "Memoria USB 128GB Ultra",
        imagen: "/products/usb-ultra-128gb.png",
        precio: 24.99,
    },
    ];

    return (
    <div className="p-6 pt-28 bg-white min-h-screen">
        <h1 className="text-3xl font-bold mb-8 text-gray-800">Memorias USB</h1>
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

export default MemoriaUSB;
