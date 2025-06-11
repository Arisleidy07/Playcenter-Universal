// src/categories/SmartTV.jsx
import React from "react";
import { Link } from "react-router-dom";

function SmartTV() {
    const productos = [
    {
        id: 1001,
        nombre: "Smart TV LG 50'' 4K UHD",
        imagen: "/products/lg-50-4k.png",
        precio: 499.99,
    },
    {
        id: 1002,
        nombre: "Samsung QLED 55'' Smart TV",
        imagen: "/products/samsung-qled-55.png",
        precio: 749.99,
    },
    {
        id: 1003,
        nombre: "TCL Roku TV 43''",
        imagen: "/products/tcl-roku-43.png",
        precio: 349.99,
    },
    ];

    return (
    <div className="p-6 pt-28 bg-white min-h-screen">
        <h1 className="text-3xl font-bold mb-8 text-gray-800">Smart TV</h1>
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

export default SmartTV;
