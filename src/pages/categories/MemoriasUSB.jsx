// src/pages/categories/MemoriasUSB.jsx
import React from "react";
import { Link } from "react-router-dom";
import "../../styles/blobCard.css";

function MemoriasUSB() {
    const productos = [
    {
        id: 180,
        nombre: "USB 3.0 Kingston 64GB",
        imagen: "/products/usb-kingston.jpg",
        precio: 14.99,
    },
    {
        id: 181,
        nombre: "USB SanDisk 128GB",
        imagen: "/products/usb-sandisk.jpg",
        precio: 22.99,
    },
    ];

    return (
    <div className="p-6 pt-28 bg-white min-h-screen">
        <h1 className="text-3xl font-bold mb-8 text-gray-800">Memorias USB</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {productos.map((producto) => (
            <Link to={`/producto/${producto.id}`} key={producto.id} className="card transform transition-transform duration-300 hover:scale-105">
            <div className="bg"></div>
            <div className="blob"></div>
            <img src={producto.imagen} alt={producto.nombre} className="z-10 w-32 h-32 object-contain mx-auto" />
            <h2 className="z-10 mt-4 font-semibold text-gray-800 text-center">{producto.nombre}</h2>
            <p className="z-10 text-pink-600 font-bold text-center">${producto.precio}</p>
            </Link>
        ))}
        </div>
    </div>
    );
}

export default MemoriasUSB;
