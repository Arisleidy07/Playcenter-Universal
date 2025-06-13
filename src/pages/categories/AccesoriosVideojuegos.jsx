import React from "react";
import "../styles/blobCard.css";
import { Link } from "react-router-dom";

function AccesoriosVideojuegos() {
    const productos = [
    {
        id: 1,
        nombre: "Soporte de control PS5 doble carga",
        imagen: "/products/soporte-controles.jpg",
        precio: 25.99,
    },
    {
        id: 2,
        nombre: "Base refrigeradora para consola Xbox",
        imagen: "/products/base-refrigeracion.jpg",
        precio: 34.99,
    },
    {
        id: 3,
        nombre: "Auriculares Gaming con micrófono",
        imagen: "/products/auriculares-gamer.jpg",
        precio: 44.99,
    },
    {
        id: 4,
        nombre: "Grip antideslizante para Nintendo Switch",
        imagen: "/products/grip-switch.jpg",
        precio: 14.99,
    },
    ];

    return (
    <div className="p-6 pt-28 bg-white min-h-screen">
        <h1 className="text-3xl font-bold mb-8 text-gray-800">Accesorios para Videojuegos</h1>
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

export default AccesoriosVideojuegos;
