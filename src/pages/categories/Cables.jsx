import React from "react";
import { Link } from "react-router-dom";
import "../../styles/blobCard.css";

function Cables() {
    const productos = [
    {
        id: 201,
        nombre: "Cable USB-C 1m",
        imagen: "/products/cable-usbc.jpg",
        precio: 299,
    },
    {
        id: 202,
        nombre: "Cable HDMI 2.0",
        imagen: "/products/cable-hdmi.jpg",
        precio: 499,
    },
    ];

    return (
    <div className="p-6 pt-28 bg-white min-h-screen">
        <h1 className="text-3xl font-bold mb-8 text-gray-800">Cables</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {productos.map((producto) => (
            <Link to={`/producto/${producto.id}`} key={producto.id} className="card hover:scale-105 transition-transform duration-300">
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

export default Cables;
