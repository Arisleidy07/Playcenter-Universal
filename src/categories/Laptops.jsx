// src/categories/Laptops.jsx
import React from "react";
import { Link } from "react-router-dom";

function Laptops() {
    const productos = [
    {
        id: 301,
        nombre: "Laptop HP 15.6'' Ryzen 5",
        imagen: "/products/laptop-hp-ryzen5.png",
        precio: 549.99,
    },
    {
        id: 302,
        nombre: "MacBook Air M1 13''",
        imagen: "/products/macbook-air-m1.png",
        precio: 899.99,
    },
    {
        id: 303,
        nombre: "Dell Inspiron 14'' i7",
        imagen: "/products/laptop-dell-i7.png",
        precio: 799.99,
    },
    ];

    return (
    <div className="p-6 pt-28 bg-white min-h-screen">
        <h1 className="text-3xl font-bold mb-8 text-gray-800">Laptops</h1>
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

export default Laptops;
