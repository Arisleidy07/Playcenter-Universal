import React from "react";
import { Link } from "react-router-dom";

function HogarInteligente() {
    const productos = [
    {
        id: 1,
        nombre: "Bombillo inteligente WiFi",
        imagen: "/products/bombillo-smart.jpg",
        precio: 19.99,
    },
    {
        id: 2,
        nombre: "Enchufe inteligente Alexa",
        imagen: "/products/enchufe-smart.jpg",
        precio: 24.99,
    },
    {
        id: 3,
        nombre: "Cámara de seguridad inteligente",
        imagen: "/products/camara-seguridad.jpg",
        precio: 39.99,
    },
    {
        id: 4,
        nombre: "Sensor de puerta WiFi",
        imagen: "/products/sensor-puerta.jpg",
        precio: 14.99,
    },
    ];

    return (
    <div className="p-6 pt-28 bg-white min-h-screen">
        <h1 className="text-3xl font-bold mb-8 text-gray-800">Hogar Inteligente</h1>
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

export default HogarInteligente;
