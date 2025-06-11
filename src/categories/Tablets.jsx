// src/categories/Tablets.jsx
import React from "react";
import { Link } from "react-router-dom";

function Tablets() {
    const productos = [
    {
        id: 1301,
        nombre: "Tablet Samsung Galaxy Tab A8",
        imagen: "/products/tablet-samsung.png",
        precio: 199.99,
    },
    {
        id: 1302,
        nombre: "iPad 9ª Generación 10.2''",
        imagen: "/products/ipad-9gen.png",
        precio: 329.99,
    },
    {
        id: 1303,
        nombre: "Tablet Lenovo Tab M10 HD",
        imagen: "/products/tablet-lenovo.png",
        precio: 149.99,
    },
    ];

    return (
    <div className="p-6 pt-28 bg-white min-h-screen">
        <h1 className="text-3xl font-bold mb-8 text-gray-800">Tablets</h1>
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

export default Tablets;
