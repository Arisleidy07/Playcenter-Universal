import React from "react";
import { Link } from "react-router-dom";

function Cables() {
    const productos = [
    {
        id: 1,
        nombre: "Cable HDMI 2.1 4K",
        imagen: "/products/cable-hdmi.jpg",
        precio: 14.99,
    },
    {
        id: 2,
        nombre: "Cable Lightning Original Apple",
        imagen: "/products/cable-lightning.jpg",
        precio: 19.99,
    },
    {
        id: 3,
        nombre: "Cable USB-C a USB 3.0",
        imagen: "/products/cable-usbc.jpg",
        precio: 9.99,
    },
    {
        id: 4,
        nombre: "Cable Micro USB resistente",
        imagen: "/products/cable-microusb.jpg",
        precio: 6.99,
    },
    ];

    return (
    <div className="p-6 pt-28 bg-white min-h-screen">
        <h1 className="text-3xl font-bold mb-8 text-gray-800">Cables</h1>
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
                className="z-10 w-32 h-32 object-contain mx-auto"
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

export default Cables;
